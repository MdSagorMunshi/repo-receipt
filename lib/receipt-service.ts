import { getCachedReceipt, setCachedReceipt } from "@/lib/cache";
import { fetchRepoData } from "@/lib/github";
import { renderReceiptPng } from "@/lib/receipt-image";
import { getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

export const RECEIPT_RENDER_VERSION = "v4";

export async function generateReceiptPng(
  owner: string,
  repo: string,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
  skipCache = false,
) {
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);
  const cacheKey = `receipt:${RECEIPT_RENDER_VERSION}:${owner}/${repo}:${resolvedMode}:${resolvedFormat}`;

  if (!skipCache) {
    const cached = await getCachedReceipt(cacheKey);

    if (cached) {
      return cached;
    }
  }

  const data = await fetchRepoData(owner, repo);
  const png = await renderReceiptPng(data, resolvedMode, resolvedFormat);

  if (!skipCache) {
    await setCachedReceipt(cacheKey, png);
  }

  return png;
}
