import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { getAppName } from "@/lib/site";

const appName = getAppName();

export const metadata = {
  title: `About — ${appName}`,
  description: `What ${appName} is, how it works, and why the receipt itself is the product.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="font-body text-[18px] leading-9 text-[var(--text-primary)]">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">About</p>
          <h1 className="mt-5 font-display text-5xl leading-tight tracking-[-0.04em]">
            {appName} turns repository metadata into something worth sharing.
          </h1>
          <p className="mt-8 text-[var(--text-muted)]">
            The app pulls public repository data from GitHub, normalizes it into a fixed receipt
            format, renders an HTML version for immediate reading, then generates a high-resolution
            PNG using Satori and sharp so the receipt can travel as an image across feeds, README
            files, and link previews.
          </p>
          <h2 className="mt-12 font-display text-3xl">How it works</h2>
          <p className="mt-4 text-[var(--text-muted)]">
            A repo URL flows through a small parsing layer, then into server-side GitHub fetches for
            metadata, languages, commit activity, and contributor counts. Those values become a
            shared receipt model, which feeds both the interactive DOM card and the Satori element
            tree. Generated PNGs are cached in Upstash Redis for 24 hours when Redis is configured.
          </p>
          <h2 className="mt-12 font-display text-3xl">Why a receipt</h2>
          <p className="mt-4 text-[var(--text-muted)]">
            The receipt format has a built-in hierarchy: headline, line items, totals, and
            epilogue. That makes it a strong container for repository data, especially when the
            output needs to feel collectible instead of dashboard-like.
          </p>
          <h2 className="mt-12 font-display text-3xl">Built in the open</h2>
          <p className="mt-4 text-[var(--text-muted)]">
            {appName} is designed to be self-hostable and easy to audit. The source includes the
            rendering pipeline, the design tokens, and the exact component structure that powers the
            generated image.
          </p>
          <h2 className="mt-12 font-display text-3xl">Developer</h2>
          <div className="mt-4 space-y-4 text-[var(--text-muted)]">
            <p>
              <span className="text-[var(--text-primary)]">Ryan Shelby</span> maintains the product direction,
              interface, and release quality for {appName}.
            </p>
            <p className="font-mono text-sm">
              GitHub:{" "}
              <Link href="https://github.com/MdSagorMunshi" className="underline underline-offset-4">
                github.com/MdSagorMunshi
              </Link>
            </p>
            <p className="font-mono text-sm">
              GitLab:{" "}
              <Link href="https://gitlab.com/rynex" className="underline underline-offset-4">
                gitlab.com/rynex
              </Link>
            </p>
            <p className="font-mono text-sm">
              Support:{" "}
              <a href="mailto:ryn@disr.it" className="underline underline-offset-4">
                ryn@disr.it
              </a>
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
