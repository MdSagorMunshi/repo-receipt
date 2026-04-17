import { applyRateLimit } from "@/lib/rate-limit";
import { parseRepoUrl } from "@/lib/transform";
import { generateComparePng } from "@/lib/compare-service";
import { getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
import { getClientIp } from "@/lib/request-security";
import { RepoFetchError } from "@/lib/types";

export const runtime = "nodejs";

const PUBLIC_LIMIT = 60;

function cacheHeaders(rateLimit: Awaited<ReturnType<typeof applyRateLimit>>) {
  return {
    "Content-Type": "image/png",
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
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
  const skipCache = process.env.NODE_ENV === "development" || requestUrl.searchParams.has("fresh");
  const rateLimit = await applyRateLimit("public-compare", getClientIp(request), PUBLIC_LIMIT);

  if (!rateLimit.allowed) {
    return new Response("Public compare image limit reached. Try again later.", {
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
    return new Response("Two valid repos are required for compare output.", {
      status: 400,
      headers: cacheHeaders(rateLimit),
    });
  }

  try {
    const png = await generateComparePng(left, right, mode, format, skipCache);

    return new Response(new Uint8Array(png), {
      status: 200,
      headers: cacheHeaders(rateLimit),
    });
  } catch (error) {
    if (error instanceof RepoFetchError) {
      return new Response(error.message, {
        status: error.status,
        headers: {
          ...(error.resetAt ? { "x-ratelimit-reset-at": error.resetAt } : {}),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
        },
      });
    }

    console.error("repo-receipt compare image generation failed", error);
    return new Response("Compare rendering failed.", {
      status: 500,
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
      },
    });
  }
}
