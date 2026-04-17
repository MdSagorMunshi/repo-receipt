import { getCachedReceipt, setCachedReceipt } from "@/lib/cache";
import { buildComparePath, type CompareRepoRef } from "@/lib/compare-routes";
import { fetchRepoData } from "@/lib/github";
import { renderComparePng } from "@/lib/compare-image";
import { getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
import { getSiteUrl } from "@/lib/site";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

export const COMPARE_RENDER_VERSION = "v1";

export async function generateComparePng(
  left: CompareRepoRef,
  right: CompareRepoRef,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
  skipCache = false,
) {
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);
  const cacheKey = `compare:${COMPARE_RENDER_VERSION}:${left.owner}/${left.repo}:${right.owner}/${right.repo}:${resolvedMode}:${resolvedFormat}`;

  if (!skipCache) {
    const cached = await getCachedReceipt(cacheKey);

    if (cached) {
      return cached;
    }
  }

  const [leftData, rightData] = await Promise.all([
    fetchRepoData(left.owner, left.repo),
    fetchRepoData(right.owner, right.repo),
  ]);
  const compareUrl = new URL(buildComparePath(left, right, resolvedMode, resolvedFormat), getSiteUrl()).toString();
  const png = await renderComparePng(leftData, rightData, compareUrl, resolvedMode, resolvedFormat);

  if (!skipCache) {
    await setCachedReceipt(cacheKey, png);
  }

  return png;
}
