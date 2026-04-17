import type { ReceiptMode } from "@/lib/types";

export interface ReceiptModeDefinition {
  id: ReceiptMode;
  label: string;
  shortLabel: string;
  kicker: string;
  cardClassName: string;
  pageAccentClassName: string;
}

export const receiptModes: ReceiptModeDefinition[] = [
  {
    id: "fine-print",
    label: "Fine Print",
    shortLabel: "Fine Print",
    kicker: "Michelin check meets Swiss broadsheet",
    cardClassName: "receipt-mode-fine-print",
    pageAccentClassName: "mode-accent-fine-print",
  },
  {
    id: "thermal",
    label: "Thermal",
    shortLabel: "Thermal",
    kicker: "Fresh off the printer, warmer and noisier",
    cardClassName: "receipt-mode-thermal",
    pageAccentClassName: "mode-accent-thermal",
  },
  {
    id: "archive",
    label: "Archive",
    shortLabel: "Archive",
    kicker: "Institutional catalog slip with calmer structure",
    cardClassName: "receipt-mode-archive",
    pageAccentClassName: "mode-accent-archive",
  },
  {
    id: "ledger-noir",
    label: "Ledger Noir",
    shortLabel: "Ledger Noir",
    kicker: "Darker, sharper accounting drama",
    cardClassName: "receipt-mode-ledger-noir",
    pageAccentClassName: "mode-accent-ledger-noir",
  },
];

const modeMap = new Map(receiptModes.map((mode) => [mode.id, mode]));

export function getReceiptMode(mode: string | null | undefined): ReceiptMode {
  return modeMap.has(mode as ReceiptMode) ? (mode as ReceiptMode) : "fine-print";
}

export function getReceiptModeDefinition(mode: string | null | undefined) {
  return modeMap.get(getReceiptMode(mode)) ?? receiptModes[0];
}

export function buildReceiptPath(owner: string, repo: string, mode: ReceiptMode) {
  const base = `/r/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  return mode === "fine-print" ? base : `${base}?mode=${encodeURIComponent(mode)}`;
}
