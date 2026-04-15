import Link from "next/link";

import { getAppName } from "@/lib/site";

const appName = getAppName();

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--text-faint)] bg-[var(--surface-bg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{appName}</p>
            <p className="mt-4 max-w-xl font-body text-[15px] leading-7 text-[var(--text-muted)]">
              Shareable GitHub repository receipts with a print-led interface, downloadable PNG output,
              and open embeds for README files and social previews.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Navigate</p>
            <div className="mt-4 flex flex-col gap-3 font-mono text-sm text-[var(--text-primary)]">
              <Link href="/">Home</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/about">About</Link>
              <Link href="/offline">Offline</Link>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Developer</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--text-muted)]">
              <p className="font-body text-[16px] text-[var(--text-primary)]">Ryan Shelby</p>
              <a href="https://github.com/MdSagorMunshi" target="_blank" rel="noreferrer" className="font-mono">
                github.com/MdSagorMunshi
              </a>
              <a href="https://gitlab.com/rynex" target="_blank" rel="noreferrer" className="font-mono">
                gitlab.com/rynex
              </a>
              <a href="mailto:ryn@disr.it" className="font-mono">
                ryn@disr.it
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--text-faint)] pt-5 font-mono text-[11px] text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>Every repo has a receipt.</p>
          <p>Public embeds stay open. Interactive downloads are signed and rate-limited.</p>
        </div>
      </div>
    </footer>
  );
}
