import Link from "next/link";

import { ReceiptThumbnail } from "@/components/ReceiptThumbnail";
import { SiteHeader } from "@/components/SiteHeader";
import { UrlInputForm } from "@/components/UrlInputForm";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { fetchRepoData } from "@/lib/github";
import { sampleRepoData } from "@/lib/sample-data";
import type { RepoData } from "@/lib/types";

export const revalidate = 86400;
const githubRepoUrl = "https://github.com/MdSagorMunshi/repo-receipt";

const exampleRepos = [
  { owner: "torvalds", repo: "linux" },
  { owner: "microsoft", repo: "vscode" },
  { owner: "vercel", repo: "next.js" },
] as const;

async function getRepoOrFallback(owner: string, repo: string, fallback: RepoData) {
  try {
    return await fetchRepoData(owner, repo);
  } catch {
    return {
      ...fallback,
      owner,
      name: repo,
      fullName: `${owner}/${repo}`,
      repoUrl: `https://github.com/${owner}/${repo}`,
    };
  }
}

export default async function HomePage() {
  const heroReceipt = await getRepoOrFallback("facebook", "react", sampleRepoData);
  const examples = await Promise.all(
    exampleRepos.map((entry) => getRepoOrFallback(entry.owner, entry.repo, sampleRepoData)),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid items-center gap-14 py-8 lg:grid-cols-[minmax(0,1fr)_560px] lg:py-16">
          <div className="order-2 lg:order-1">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Every repo has a receipt.
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Every repo has a receipt.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
              Paste any public GitHub repository and get a print-worthy record of its stars, commits,
              languages, contributors, age, and open-source footprint.
            </p>
            <div className="mt-10 max-w-3xl">
              <UrlInputForm />
            </div>
            <div className="mt-10 flex items-center gap-4 font-mono text-xs text-[var(--text-muted)]">
              <Link href="/gallery" className="underline decoration-[var(--text-faint)] underline-offset-4">
                Most decorated repos
              </Link>
              <span>·</span>
              <Link href="/about" className="underline decoration-[var(--text-faint)] underline-offset-4">
                About the process
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="fine-link px-5"
              >
                Give a star on GitHub
              </a>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="w-full max-w-[540px]" style={{ transform: "rotate(3deg)" }}>
              <ReceiptCard data={heroReceipt} />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-display text-2xl italic">Three examples to start with</p>
            <p className="hidden font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] sm:block">
              Scroll the paper trail
            </p>
          </div>
          <div className="thin-scrollbar flex gap-4 overflow-x-auto pb-4">
            {examples.map((repo) => (
              <div key={repo.fullName} className="min-w-[210px] max-w-[210px] flex-none">
                <ReceiptThumbnail
                  href={`/r/${repo.owner}/${repo.name}`}
                  data={repo}
                  label={repo.fullName}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
