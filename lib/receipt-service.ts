import { getCachedReceipt, setCachedReceipt } from "@/lib/cache";
import { fetchRepoData } from "@/lib/github";
import { renderReceiptPng } from "@/lib/receipt-image";

export const RECEIPT_RENDER_VERSION = "v3";

export async function generateReceiptPng(owner: string, repo: string, skipCache = false) {
  const cacheKey = `receipt:${RECEIPT_RENDER_VERSION}:${owner}/${repo}`;

  if (!skipCache) {
    const cached = await getCachedReceipt(cacheKey);

    if (cached) {
      return cached;
    }
  }

  const data = await fetchRepoData(owner, repo);
  const png = await renderReceiptPng(data);

  if (!skipCache) {
    await setCachedReceipt(cacheKey, png);
  }

  return png;
}
