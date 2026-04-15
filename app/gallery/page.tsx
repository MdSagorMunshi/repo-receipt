import Image from "next/image";

import { ReceiptThumbnail } from "@/components/ReceiptThumbnail";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchGalleryRepos, fetchRepoData } from "@/lib/github";
import { sampleRepoData } from "@/lib/sample-data";
import { getAppName } from "@/lib/site";

export const revalidate = 604800;

const appName = getAppName();

export const metadata = {
  title: `Gallery — ${appName}`,
  description: "A gallery of the most decorated open-source repositories rendered as receipts.",
};

export default async function GalleryPage() {
  const repos = await fetchGalleryRepos().catch(() => [
    { owner: "facebook", repo: "react", fullName: "facebook/react", description: sampleRepoData.description, stars: sampleRepoData.stars },
    { owner: "vercel", repo: "next.js", fullName: "vercel/next.js", description: "The React Framework", stars: 0 },
    { owner: "microsoft", repo: "vscode", fullName: "microsoft/vscode", description: "Code editing. Redefined.", stars: 0 },
  ]);

  const cards = await Promise.all(
    repos.map(async (repo) => {
      try {
        return await fetchRepoData(repo.owner, repo.repo);
      } catch {
        return {
          ...sampleRepoData,
          owner: repo.owner,
          name: repo.repo,
          fullName: repo.fullName,
          description: repo.description,
          stars: repo.stars || sampleRepoData.stars,
          repoUrl: `https://github.com/${repo.owner}/${repo.repo}`,
        };
      }
    }),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden border border-[var(--text-faint)]">
          <Image
            src="/gallery-header.png"
            alt=""
            width={1440}
            height={320}
            className="h-40 w-full object-cover"
          />
        </div>
        <div className="mt-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Gallery</p>
            <h1 className="mt-4 font-display text-5xl tracking-[-0.04em]">Most decorated repos</h1>
          </div>
          <p className="hidden max-w-md font-mono text-xs leading-6 text-[var(--text-muted)] lg:block">
            A weekly revalidated wall of repositories rendered as fine-print keepsakes.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {cards.map((repo) => (
            <ReceiptThumbnail key={repo.fullName} href={`/r/${repo.owner}/${repo.name}`} data={repo} />
          ))}
        </div>
      </main>
    </div>
  );
}
