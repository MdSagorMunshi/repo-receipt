"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import { getAppName, getSiteUrl } from "@/lib/site";

interface ActionPanelProps {
  owner: string;
  repo: string;
  stars: number;
  commitCount: number;
  repoAgeLabel: string;
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

export function ActionPanel({ owner, repo, stars, commitCount, repoAgeLabel }: ActionPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");
  const receiptPath = `/r/${owner}/${repo}`;
  const imagePath = `/api/generate/${owner}/${repo}`;
  const downloadPath = process.env.NODE_ENV === "development" ? `${imagePath}?fresh=1` : imagePath;
  const appName = getAppName();
  const siteUrl = getSiteUrl();

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
      anchor.download = `${owner}-${repo}-receipt.png`;
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
    const text = `Just got the receipt for ${owner}/${repo} — ${stars} ★ stars, ${commitCount} commits, ${repoAgeLabel} old. Generate yours at ${appName} 🧾 ${absoluteUrl(
      receiptPath,
    )}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const embedCode = `[![repo-receipt](${absoluteUrl(imagePath)})](${absoluteUrl(receiptPath)})`;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2.5">
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
      <button type="button" className="panel-button" onClick={() => copyText("link", absoluteUrl(receiptPath))}>
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
