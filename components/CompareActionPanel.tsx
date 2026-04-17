"use client";

import Link from "next/link";
import { useState } from "react";

import type { CompareRepoRef } from "@/lib/compare-routes";
import { buildCompareGeneratePath, buildComparePath } from "@/lib/compare-routes";
import { receiptFormats } from "@/lib/receipt-formats";
import { getAppName, getSiteUrl } from "@/lib/site";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

interface CompareActionPanelProps {
  left: CompareRepoRef;
  right: CompareRepoRef;
  leftStars: number;
  rightStars: number;
  downloadPath: string;
  mode?: ReceiptMode;
  format?: ReceiptFormat;
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2v8m0 0 3-3m-3 3L6 7M3 13.5h12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M6 6.5h7.5v8H6zM4.5 3.5H12v1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M13.7 3H16l-5 5.7L16.4 15h-4.2L8.9 10.9 5.3 15H3l5.3-6L3.2 3h4.3l3 3.9L13.7 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MarkdownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 4.5h13v9h-13zM5 11V8l2 2 2-2v3m2-1.5h3m-1.5-1.5v3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function CompareActionPanel({
  left,
  right,
  leftStars,
  rightStars,
  downloadPath,
  mode = "fine-print",
  format = "portrait",
}: CompareActionPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");
  const siteUrl = getSiteUrl();
  const appName = getAppName();
  const comparePath = buildComparePath(left, right, mode, format);
  const imagePath = buildCompareGeneratePath(left, right, mode, format);
  const currentFormat = receiptFormats.find((entry) => entry.id === format) ?? receiptFormats[0];

  function absoluteUrl(path: string) {
    return new URL(path, siteUrl).toString();
  }

  async function copyText(kind: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function handleDownload() {
    try {
      setDownloadState("loading");
      const response = await fetch(downloadPath, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${left.owner}-${left.repo}-vs-${right.owner}-${right.repo}-${currentFormat.downloadSuffix}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
      window.setTimeout(() => setDownloadState("idle"), 2200);
    }
  }

  function shareOnX() {
    const totalStars = leftStars + rightStars;
    const text = `Split the bill for ${left.owner}/${left.repo} vs ${right.owner}/${right.repo} — ${totalStars} ★ across both tabs. Compare yours on ${appName} 🧾 ${absoluteUrl(
      comparePath,
    )}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const embedCode = `[![repo-receipt compare](${absoluteUrl(imagePath)})](${absoluteUrl(comparePath)})`;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2.5">
      <div className="border border-[var(--text-faint)] p-4">
        <p className="font-display text-xl italic">Formats</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {receiptFormats.map((entry) => {
            const href = buildComparePath(left, right, mode, entry.id);
            const active = entry.id === format;

            return (
              <Link
                key={entry.id}
                href={href}
                className={`inline-flex min-h-9 items-center border px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-[var(--text-primary)] bg-[var(--cr-stamp-light)] text-[var(--cr-ink)]"
                    : "border-[var(--text-faint)] text-[var(--text-primary)] hover:border-[var(--text-primary)]"
                }`}
              >
                {entry.shortLabel}
              </Link>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">
          Active output: {currentFormat.label}
        </p>
      </div>
      <button type="button" className="panel-button" onClick={handleDownload}>
        <span>
          {downloadState === "loading"
            ? "Preparing PNG"
            : downloadState === "error"
              ? "PNG Failed"
              : "Download PNG"}
        </span>
        <DownloadIcon />
      </button>
      <button type="button" className="panel-button" onClick={() => copyText("link", absoluteUrl(comparePath))}>
        <span>{copied === "link" ? "Link Copied" : "Copy Link"}</span>
        <CopyIcon />
      </button>
      <button type="button" className="panel-button" onClick={shareOnX}>
        <span>Share on X</span>
        <ShareIcon />
      </button>
      <button type="button" className="panel-button" onClick={() => copyText("embed", embedCode)}>
        <span>{copied === "embed" ? "Embed Copied" : "Copy README Embed"}</span>
        <MarkdownIcon />
      </button>
    </div>
  );
}
