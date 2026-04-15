import { getCachedReceipt, setCachedReceipt } from "@/lib/cache";
import { fetchRepoData } from "@/lib/github";
import { renderReceiptPng } from "@/lib/receipt-image";
import { RepoFetchError } from "@/lib/types";

export const runtime = "nodejs";
const RECEIPT_RENDER_VERSION = "v2";

function cacheHeaders() {
  return {
    "Content-Type": "image/png",
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await context.params;
  const requestUrl = new URL(request.url);
  const skipCache = process.env.NODE_ENV === "development" || requestUrl.searchParams.has("fresh");
  const cacheKey = `receipt:${RECEIPT_RENDER_VERSION}:${owner}/${repo}`;

  try {
    if (!skipCache) {
      const cached = await getCachedReceipt(cacheKey);

      if (cached) {
        return new Response(new Uint8Array(cached), {
          status: 200,
          headers: cacheHeaders(),
        });
      }
    }

    const data = await fetchRepoData(owner, repo);
    const png = await renderReceiptPng(data);

    if (!skipCache) {
      await setCachedReceipt(cacheKey, png);
    }

    return new Response(new Uint8Array(png), {
      status: 200,
      headers: cacheHeaders(),
    });
  } catch (error) {
    if (error instanceof RepoFetchError) {
      return new Response(error.message, {
        status: error.status,
        headers: error.resetAt ? { "x-ratelimit-reset-at": error.resetAt } : undefined,
      });
    }

    console.error("repo-receipt image generation failed", error);
    return new Response("Receipt rendering failed.", { status: 500 });
  }
}
