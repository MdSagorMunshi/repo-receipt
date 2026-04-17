"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { receiptFormats } from "@/lib/receipt-formats";
import { receiptModes } from "@/lib/receipt-modes";
import { parseRepoUrl } from "@/lib/transform";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

interface UrlInputFormProps {
  initialValue?: string;
  buttonLabel?: string;
  compact?: boolean;
  initialMode?: ReceiptMode;
  initialFormat?: ReceiptFormat;
}

export function UrlInputForm({
  initialValue = "",
  buttonLabel = "Print Receipt →",
  compact = false,
  initialMode = "fine-print",
  initialFormat = "portrait",
}: UrlInputFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ReceiptMode>(initialMode);
  const [format, setFormat] = useState<ReceiptFormat>(initialFormat);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRepoUrl(value);

    if (!parsed) {
      setError("Enter a valid GitHub repo URL or owner/repo.");
      return;
    }

    setError("");
    const query = new URLSearchParams();

    if (mode !== "fine-print") {
      query.set("mode", mode);
    }

    if (format !== "portrait") {
      query.set("format", format);
    }

    const search = query.toString();
    const target = `/r/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}${
      search ? `?${search}` : ""
    }`;
    startTransition(() => {
      router.push(target);
      router.refresh();
    });
  }

  return (
    <form
      className={`flex w-full flex-col ${compact ? "gap-3" : "gap-4 md:flex-row md:items-end"}`}
      onSubmit={handleSubmit}
    >
      <div className="flex-1">
        <label
          htmlFor="repo-input"
          className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
        >
          Public GitHub repository
        </label>
        <input
          id="repo-input"
          className="mono-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="github.com/owner/repo"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
        {error ? (
          <p className="mt-3 font-mono text-xs text-[var(--cr-danger)]">{error}</p>
        ) : null}
      </div>
      <div className={compact ? "" : "w-full md:w-[190px]"}>
        <label
          htmlFor={`mode-input-${compact ? "compact" : "default"}`}
          className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
        >
          Receipt mode
        </label>
        <select
          id={`mode-input-${compact ? "compact" : "default"}`}
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
      <div className={compact ? "" : "w-full md:w-[190px]"}>
        <label
          htmlFor={`format-input-${compact ? "compact" : "default"}`}
          className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
        >
          Output format
        </label>
        <select
          id={`format-input-${compact ? "compact" : "default"}`}
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
      <button type="submit" className="fine-button px-5">
        {buttonLabel}
      </button>
    </form>
  );
}
