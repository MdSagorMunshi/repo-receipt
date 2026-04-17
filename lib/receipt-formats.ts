import { getReceiptMode } from "@/lib/receipt-modes";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

export interface ReceiptFormatDefinition {
  id: ReceiptFormat;
  label: string;
  shortLabel: string;
  downloadSuffix: string;
  shellClassName: string;
  stageClassName: string;
  scaleClassName: string;
}

export const receiptFormats: ReceiptFormatDefinition[] = [
  {
    id: "portrait",
    label: "Portrait Receipt",
    shortLabel: "Portrait",
    downloadSuffix: "receipt",
    shellClassName: "receipt-shell-portrait",
    stageClassName: "receipt-stage-portrait",
    scaleClassName: "receipt-scale-portrait",
  },
  {
    id: "square",
    label: "Square Social Card",
    shortLabel: "Square",
    downloadSuffix: "square-card",
    shellClassName: "receipt-shell-square",
    stageClassName: "receipt-stage-square",
    scaleClassName: "receipt-scale-square",
  },
  {
    id: "story",
    label: "Story Card",
    shortLabel: "Story",
    downloadSuffix: "story-card",
    shellClassName: "receipt-shell-story",
    stageClassName: "receipt-stage-story",
    scaleClassName: "receipt-scale-story",
  },
  {
    id: "readme-strip",
    label: "README Strip",
    shortLabel: "README Strip",
    downloadSuffix: "readme-strip",
    shellClassName: "receipt-shell-readme-strip",
    stageClassName: "receipt-stage-readme-strip",
    scaleClassName: "receipt-scale-readme-strip",
  },
];

const formatMap = new Map(receiptFormats.map((format) => [format.id, format]));

export function getReceiptFormat(format: string | null | undefined): ReceiptFormat {
  return formatMap.has(format as ReceiptFormat) ? (format as ReceiptFormat) : "portrait";
}

export function getReceiptFormatDefinition(format: string | null | undefined) {
  return formatMap.get(getReceiptFormat(format)) ?? receiptFormats[0];
}

export function buildReceiptVariantPath(owner: string, repo: string, mode: ReceiptMode, format: ReceiptFormat) {
  const base = `/r/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);
  const search = new URLSearchParams();

  if (resolvedMode !== "fine-print") {
    search.set("mode", resolvedMode);
  }

  if (resolvedFormat !== "portrait") {
    search.set("format", resolvedFormat);
  }

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export function buildGenerateVariantPath(owner: string, repo: string, mode: ReceiptMode, format: ReceiptFormat) {
  const base = `/api/generate/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);
  const search = new URLSearchParams();

  if (resolvedMode !== "fine-print") {
    search.set("mode", resolvedMode);
  }

  if (resolvedFormat !== "portrait") {
    search.set("format", resolvedFormat);
  }

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}
