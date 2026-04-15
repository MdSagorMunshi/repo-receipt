import Link from "next/link";

import { GitHubStarButton } from "@/components/GitHubStarButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAppName } from "@/lib/site";

export async function SiteHeader() {
  const appName = getAppName();

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="font-mono text-xs tracking-[0.28em] text-[var(--text-primary)] uppercase">
        {appName}
      </Link>
      <div className="flex items-center gap-3">
        <GitHubStarButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
