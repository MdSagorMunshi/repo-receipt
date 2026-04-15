import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">404</p>
        <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight tracking-[-0.04em]">
          This receipt slip never made it to the printer.
        </h1>
        <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-[var(--text-muted)]">
          The page you asked for does not exist, may have moved, or was never part of the receipt stack.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="fine-link px-6 py-3">
            Return Home
          </Link>
          <Link href="/gallery" className="fine-link px-6 py-3">
            Browse Gallery
          </Link>
        </div>
      </main>
    </div>
  );
}
