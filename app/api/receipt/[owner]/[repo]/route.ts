import { verifyProtectedReceiptSignature } from "@/lib/api-signing";
import { applyRateLimit } from "@/lib/rate-limit";
import { generateReceiptPng } from "@/lib/receipt-service";
import { getClientIp, isAllowedProtectedClient } from "@/lib/request-security";
import { RepoFetchError } from "@/lib/types";

export const runtime = "nodejs";

const PROTECTED_LIMIT = 20;

function privateHeaders(rateLimit: Awaited<ReturnType<typeof applyRateLimit>>) {
  return {
    "Content-Type": "image/png",
    "Cache-Control": "private, no-store, max-age=0",
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await context.params;
  const requestUrl = new URL(request.url);
  const rateLimit = await applyRateLimit("protected-receipt", getClientIp(request), PROTECTED_LIMIT);

  if (!rateLimit.allowed) {
    return new Response("Receipt download limit reached. Try again later.", {
      status: 429,
      headers: {
        "Retry-After": String(rateLimit.retryAfter),
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
      },
    });
  }

  if (
    !verifyProtectedReceiptSignature(
      owner,
      repo,
      requestUrl.searchParams.get("expires"),
      requestUrl.searchParams.get("sig"),
    )
  ) {
    return new Response("Invalid or expired receipt signature.", {
      status: 403,
      headers: privateHeaders(rateLimit),
    });
  }

  if (!isAllowedProtectedClient(request)) {
    return new Response("Protected receipt downloads require an in-browser request from repo-receipt.", {
      status: 403,
      headers: privateHeaders(rateLimit),
    });
  }

  try {
    const png = await generateReceiptPng(owner, repo, process.env.NODE_ENV === "development");

    return new Response(new Uint8Array(png), {
      status: 200,
      headers: privateHeaders(rateLimit),
    });
  } catch (error) {
    if (error instanceof RepoFetchError) {
      return new Response(error.message, {
        status: error.status,
        headers: {
          ...(error.resetAt ? { "x-ratelimit-reset-at": error.resetAt } : {}),
          ...privateHeaders(rateLimit),
        },
      });
    }

    console.error("repo-receipt protected image generation failed", error);
    return new Response("Receipt rendering failed.", {
      status: 500,
      headers: privateHeaders(rateLimit),
    });
  }
}
