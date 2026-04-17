import { verifyProtectedCompareSignature } from "@/lib/api-signing";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseRepoUrl } from "@/lib/transform";
import { generateComparePng } from "@/lib/compare-service";
import { getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const left = parseRepoUrl(requestUrl.searchParams.get("left") ?? "");
  const right = parseRepoUrl(requestUrl.searchParams.get("right") ?? "");
  const mode = getReceiptMode(requestUrl.searchParams.get("mode"));
  const format = getReceiptFormat(requestUrl.searchParams.get("format"));
  const rateLimit = await applyRateLimit("protected-compare", getClientIp(request), PROTECTED_LIMIT);

  if (!rateLimit.allowed) {
    return new Response("Compare download limit reached. Try again later.", {
      status: 429,
      headers: {
        "Retry-After": String(rateLimit.retryAfter),
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
      },
    });
  }

  if (!left || !right) {
    return new Response("Two valid repos are required for compare download.", {
      status: 400,
      headers: privateHeaders(rateLimit),
    });
  }

  if (
    !verifyProtectedCompareSignature(
      left,
      right,
      requestUrl.searchParams.get("expires"),
      requestUrl.searchParams.get("sig"),
      requestUrl.searchParams.get("mode"),
      requestUrl.searchParams.get("format"),
    )
  ) {
    return new Response("Invalid or expired compare signature.", {
      status: 403,
      headers: privateHeaders(rateLimit),
    });
  }

  if (!isAllowedProtectedClient(request)) {
    return new Response("Protected compare downloads require an in-browser request from repo-receipt.", {
      status: 403,
      headers: privateHeaders(rateLimit),
    });
  }

  try {
    const png = await generateComparePng(left, right, mode, format, process.env.NODE_ENV === "development");

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

    console.error("repo-receipt protected compare image generation failed", error);
    return new Response("Compare rendering failed.", {
      status: 500,
      headers: privateHeaders(rateLimit),
    });
  }
}
