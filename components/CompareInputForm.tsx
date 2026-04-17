"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { buildComparePath } from "@/lib/compare-routes";
import { receiptFormats } from "@/lib/receipt-formats";
import { receiptModes } from "@/lib/receipt-modes";
import { parseRepoUrl } from "@/lib/transform";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

interface CompareInputFormProps {
  initialLeft?: string;
  initialRight?: string;
  initialMode?: ReceiptMode;
  initialFormat?: ReceiptFormat;
  compact?: boolean;
}

export function CompareInputForm({
  initialLeft = "",
  initialRight = "",
  initialMode = "fine-print",
  initialFormat = "portrait",
  compact = false,
}: CompareInputFormProps) {
  const router = useRouter();
  const [leftValue, setLeftValue] = useState(initialLeft);
  const [rightValue, setRightValue] = useState(initialRight);
  const [mode, setMode] = useState<ReceiptMode>(initialMode);
  const [format, setFormat] = useState<ReceiptFormat>(initialFormat);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const left = parseRepoUrl(leftValue);
    const right = parseRepoUrl(rightValue);

    if (!left || !right) {
      setError("Enter two valid GitHub repo URLs or owner/repo pairs.");
      return;
    }

    setError("");
    const target = buildComparePath(left, right, mode, format);

    startTransition(() => {
      router.push(target);
      router.refresh();
    });
  }

  return (
    <form className={`flex w-full flex-col ${compact ? "gap-3" : "gap-4"}`} onSubmit={handleSubmit}>
      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        <div>
          <label
            htmlFor={`compare-left-${compact ? "compact" : "default"}`}
            className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
          >
            Left repo
          </label>
          <input
            id={`compare-left-${compact ? "compact" : "default"}`}
            className="mono-input"
            type="text"
            value={leftValue}
            onChange={(event) => setLeftValue(event.target.value)}
            placeholder="owner/repo"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div>
          <label
            htmlFor={`compare-right-${compact ? "compact" : "default"}`}
            className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
          >
            Right repo
          </label>
          <input
            id={`compare-right-${compact ? "compact" : "default"}`}
            className="mono-input"
            type="text"
            value={rightValue}
            onChange={(event) => setRightValue(event.target.value)}
            placeholder="owner/repo"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </div>
      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-[1fr_1fr_auto]"}`}>
        <div>
          <label
            htmlFor={`compare-mode-${compact ? "compact" : "default"}`}
            className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
          >
            Receipt mode
          </label>
          <select
            id={`compare-mode-${compact ? "compact" : "default"}`}
            className="mono-input appearance-none"
            value={mode}
            onChange={(event) => setMode(event.target.value as ReceiptMode)}
          >
            {receiptModes.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={`compare-format-${compact ? "compact" : "default"}`}
            className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
          >
            Output format
          </label>
          <select
            id={`compare-format-${compact ? "compact" : "default"}`}
            className="mono-input appearance-none"
            value={format}
            onChange={(event) => setFormat(event.target.value as ReceiptFormat)}
          >
            {receiptFormats.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.shortLabel}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="fine-button px-5 md:self-end">
          Split the Bill →
        </button>
      </div>
      {error ? <p className="font-mono text-xs text-[var(--cr-danger)]">{error}</p> : null}
    </form>
  );
}
