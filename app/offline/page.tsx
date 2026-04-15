import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { getAppName } from "@/lib/site";

const appName = getAppName();

export const metadata = {
  title: `Offline — ${appName}`,
  description: `Fallback information for times when ${appName} cannot reach GitHub or the network.`,
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="border border-[var(--text-faint)] bg-[var(--surface-bg)] p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Offline</p>
          <h1 className="mt-5 font-display text-5xl leading-tight tracking-[-0.04em]">
            {appName} cannot print receipts without a network connection.
          </h1>
          <p className="mt-6 font-body text-lg leading-8 text-[var(--text-muted)]">
            This page is the app’s offline fallback. Receipt generation depends on live GitHub metadata,
            so the generator, PNG endpoint, and dynamic repository views are unavailable until connectivity
            returns.
          </p>
          <div className="mt-10 space-y-4 font-body text-[17px] leading-8 text-[var(--text-primary)]">
            <p>What still works offline:</p>
            <p className="text-[var(--text-muted)]">
              Local navigation to cached pages, static assets already in the browser, and any receipt PNGs
              already downloaded to your device.
            </p>
            <p>What to do next:</p>
            <p className="text-[var(--text-muted)]">
              Reconnect, refresh the page, and request the repository again. If the problem persists, check
              whether GitHub or your network path is rate-limited.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="fine-link px-6 py-3">
              Try Home Again
            </Link>
            <Link href="/about" className="fine-link px-6 py-3">
              About the App
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
