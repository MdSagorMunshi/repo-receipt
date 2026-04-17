import Image from "next/image";
import Link from "next/link";

import { ReceiptThumbnail } from "@/components/ReceiptThumbnail";
import { SiteHeader } from "@/components/SiteHeader";
import { buildGalleryCollections } from "@/lib/gallery-collections";
import { fetchGalleryRepos, fetchRepoData } from "@/lib/github";
import { summarizeMilestones } from "@/lib/milestones";
import { sampleRepoData } from "@/lib/sample-data";
import { getAppName } from "@/lib/site";
import { formatCount } from "@/lib/transform";

export const revalidate = 604800;

const appName = getAppName();

export const metadata = {
  title: `Gallery — ${appName}`,
  description: "A gallery of the most decorated open-source repositories rendered as receipts.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ collection?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
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
  const collections = buildGalleryCollections(cards);
  const milestoneSummary = summarizeMilestones(cards).slice(0, 6);
  const totalStars = cards.reduce((sum, repo) => sum + repo.stars, 0);
  const selectedCollection = resolvedSearchParams.collection?.trim() || "";
  const visibleCollections = selectedCollection
    ? collections.filter((collection) => collection.id === selectedCollection)
    : collections;

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
            <h1 className="mt-4 font-display text-5xl tracking-[-0.04em]">Collected receipts</h1>
          </div>
          <p className="hidden max-w-md font-mono text-xs leading-6 text-[var(--text-muted)] lg:block">
            A weekly revalidated set of themed shelves built from the most decorated public repositories on GitHub.
          </p>
        </div>
        <div className="mt-8 grid gap-4 border border-[var(--text-faint)] p-5 md:grid-cols-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Receipts</p>
            <p className="mt-2 font-display text-3xl italic">{formatCount(cards.length)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Collections</p>
            <p className="mt-2 font-display text-3xl italic">{formatCount(collections.length)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Stars On The Wall</p>
            <p className="mt-2 font-display text-3xl italic">{formatCount(totalStars)}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/gallery"
            className={`inline-flex min-h-9 items-center border px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              selectedCollection
                ? "border-[var(--text-faint)] text-[var(--text-primary)] hover:border-[var(--text-primary)]"
                : "border-[var(--text-primary)] bg-[var(--cr-stamp-light)] text-[var(--cr-ink)]"
            }`}
          >
            All Collections
          </Link>
          {collections.map((collection) => {
            const active = collection.id === selectedCollection;

            return (
              <Link
                key={collection.id}
                href={`/gallery?collection=${encodeURIComponent(collection.id)}`}
                className={`inline-flex min-h-9 items-center border px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-[var(--text-primary)] bg-[var(--cr-stamp-light)] text-[var(--cr-ink)]"
                    : "border-[var(--text-faint)] text-[var(--text-primary)] hover:border-[var(--text-primary)]"
                }`}
              >
                {collection.title} · {formatCount(collection.repos.length)}
              </Link>
            );
          })}
        </div>
        {milestoneSummary.length > 0 ? (
          <div className="mt-8 border border-[var(--text-faint)] p-5">
            <p className="font-display text-2xl italic">Frequent Marks</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {milestoneSummary.map((milestone) => (
                <span
                  key={milestone.id}
                  className="inline-flex min-h-9 items-center border border-[var(--cr-stamp)] px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--cr-stamp)]"
                >
                  {milestone.label} · {formatCount(milestone.count)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-10 space-y-14">
          {visibleCollections.map((collection) => (
            <section key={collection.id}>
              <div className="mb-5 flex items-end justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Collection
                  </p>
                  <h2 className="mt-3 font-display text-4xl italic">{collection.title}</h2>
                </div>
                <p className="hidden max-w-md font-mono text-xs leading-6 text-[var(--text-muted)] lg:block">
                  {collection.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                {collection.repos.map((repo) => (
                  <ReceiptThumbnail key={`${collection.id}-${repo.fullName}`} href={`/r/${repo.owner}/${repo.name}`} data={repo} />
                ))}
              </div>
            </section>
          ))}
          {selectedCollection && visibleCollections.length === 0 ? (
            <section className="border border-[var(--text-faint)] p-5">
              <p className="font-display text-3xl italic">That shelf is empty.</p>
              <p className="mt-4 font-mono text-xs leading-6 text-[var(--text-muted)]">
                The requested collection was not found. Return to the full gallery wall.
              </p>
              <Link href="/gallery" className="fine-link mt-6 px-4">
                Back to All Collections
              </Link>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
