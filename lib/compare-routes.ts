import { getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

export interface CompareRepoRef {
  owner: string;
  repo: string;
}

export function serializeCompareRepo(ref: CompareRepoRef) {
  return `${ref.owner}/${ref.repo}`;
}

function buildCompareSearchParams(
  left: CompareRepoRef,
  right: CompareRepoRef,
  mode: ReceiptMode,
  format: ReceiptFormat,
) {
  const search = new URLSearchParams({
    left: serializeCompareRepo(left),
    right: serializeCompareRepo(right),
  });
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);

  if (resolvedMode !== "fine-print") {
    search.set("mode", resolvedMode);
  }

  if (resolvedFormat !== "portrait") {
    search.set("format", resolvedFormat);
  }

  return search;
}

export function buildComparePath(
  left: CompareRepoRef,
  right: CompareRepoRef,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
) {
  return `/compare?${buildCompareSearchParams(left, right, mode, format).toString()}`;
}

export function buildCompareGeneratePath(
  left: CompareRepoRef,
  right: CompareRepoRef,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
) {
  return `/api/compare?${buildCompareSearchParams(left, right, mode, format).toString()}`;
}
