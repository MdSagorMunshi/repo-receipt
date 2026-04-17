import type { Metadata } from "next";

import { ActionPanel } from "@/components/ActionPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { UrlInputForm } from "@/components/UrlInputForm";
import { ErrorReceipt } from "@/components/receipt/ErrorReceipt";
import { ReceiptDisplayShell } from "@/components/receipt/ReceiptDisplayShell";
import { createProtectedReceiptPath } from "@/lib/api-signing";
import { buildComparePath, type CompareRepoRef } from "@/lib/compare-routes";
import { getFeaturedCompareTargets } from "@/lib/featured-compares";
import { fetchRepoData, fetchRepoMetadata } from "@/lib/github";
import { buildGenerateVariantPath, buildReceiptVariantPath, getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
import { getAppName, getSiteUrl } from "@/lib/site";
import { formatAgeLabel, truncateText } from "@/lib/transform";
import { ReceiptFormat, ReceiptMode, RepoFetchError } from "@/lib/types";

export const revalidate = 86400;

interface ReceiptPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
  searchParams?: Promise<{
    mode?: string;
    format?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: ReceiptPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const mode = getReceiptMode(resolvedSearchParams.mode);
  const format = getReceiptFormat(resolvedSearchParams.format);
  const appName = getAppName();

  try {
    const metadata = await fetchRepoMetadata(owner, repo);

    const imagePath = buildGenerateVariantPath(owner, repo, mode, format);

    return {
      title: `${metadata.fullName} on ${appName}`,
      description: truncateText(metadata.description, 160),
      openGraph: {
        title: `${metadata.fullName} on ${appName}`,
        description: truncateText(metadata.description, 160),
        images: [imagePath],
      },
      twitter: {
        card: "summary_large_image",
        title: `${metadata.fullName} on ${appName}`,
        description: truncateText(metadata.description, 160),
        images: [imagePath],
      },
    };
  } catch {
    return {
      title: `${owner}/${repo} on ${appName}`,
      description: "Generate a beautiful, shareable receipt for this public GitHub repository.",
    };
  }
}

export default async function ReceiptPage({ params, searchParams }: ReceiptPageProps) {
  const { owner, repo } = await params;
  const siteUrl = getSiteUrl();
  const resolvedSearchParams = (await searchParams) ?? {};
  const mode = getReceiptMode(resolvedSearchParams.mode);
  const format = getReceiptFormat(resolvedSearchParams.format);
  let data: Awaited<ReturnType<typeof fetchRepoData>> | null = null;
  let fetchError: unknown = null;

  try {
    data = await fetchRepoData(owner, repo);
  } catch (error) {
    fetchError = error;
  }

  if (fetchError) {
    if (fetchError instanceof RepoFetchError) {
      if (fetchError.status === 429) {
        const resetLabel = fetchError.resetAt ? ` Rate limit resets at ${fetchError.resetAt}.` : "";
        return (
          <div className="min-h-screen">
            <SiteHeader />
            <ErrorReceipt
              repoLabel={`${owner}/${repo}`}
              message={`GitHub's API is taking a breather. Try again in a few minutes.${resetLabel}`}
            />
          </div>
        );
      }

      if (fetchError.status >= 500) {
        return (
          <div className="min-h-screen">
            <SiteHeader />
            <ErrorReceipt
              repoLabel={`${owner}/${repo}`}
              message="GitHub returned an unexpected response while assembling this receipt. The repository may still be public, but one of the upstream data calls failed. Try again in a moment."
            />
          </div>
        );
      }

      return (
        <div className="min-h-screen">
          <SiteHeader />
          <ErrorReceipt
            repoLabel={`${owner}/${repo}`}
            message="That repository could not be found, is private, or GitHub returned an error while printing the receipt."
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <SiteHeader />
        <ErrorReceipt
          repoLabel={`${owner}/${repo}`}
          message="The receipt press hit a fault while rendering. Try again in a moment."
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <ErrorReceipt
          repoLabel={`${owner}/${repo}`}
          message="The receipt press hit a fault while rendering. Try again in a moment."
        />
      </div>
    );
  }

  const imageUrl = new URL(
    buildGenerateVariantPath(owner, repo, mode, format),
    siteUrl,
  ).toString();
  const receiptUrl = new URL(buildReceiptVariantPath(owner, repo, mode, format), siteUrl).toString();
  const downloadPath = createProtectedReceiptPath(owner, repo, mode, format);
  const embedCode = `[![repo-receipt](${imageUrl})](${receiptUrl})`;

  return (
    <ReceiptPageContent
      data={data}
      owner={owner}
      repo={repo}
      embedCode={embedCode}
      downloadPath={downloadPath}
      mode={mode}
      format={format}
    />
  );
}

function ReceiptPageContent({
  data,
  owner,
  repo,
  embedCode,
  downloadPath,
  mode,
  format,
}: {
  data: Awaited<ReturnType<typeof fetchRepoData>>;
  owner: string;
  repo: string;
  embedCode: string;
  downloadPath: string;
  mode: ReceiptMode;
  format: ReceiptFormat;
}) {
  const currentRepo = { owner, repo } satisfies CompareRepoRef;
  const compareTargets = getFeaturedCompareTargets(currentRepo).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,680px)_minmax(320px,420px)] xl:justify-center">
          <ReceiptDisplayShell data={data} mode={mode} format={format} />
          <div className="flex flex-col gap-6">
            <ActionPanel
              owner={owner}
              repo={repo}
              stars={data.stars}
              commitCount={data.totalCommits}
              repoAgeLabel={formatAgeLabel(data.repoAge)}
              downloadPath={downloadPath}
              mode={mode}
              format={format}
            />
            <div className="border border-[var(--text-faint)] p-4">
              <p className="font-display text-xl italic">README Embed</p>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap border border-[var(--text-faint)] bg-[var(--surface-bg)] p-3 font-mono text-[11px] leading-5 text-[var(--text-muted)]">
                {embedCode}
              </pre>
            </div>
            <div className="border border-[var(--text-faint)] p-4">
              <p className="font-display text-xl italic">Generate another</p>
              <div className="mt-4">
                <UrlInputForm
                  initialValue={`${owner}/${repo}`}
                  compact
                  initialMode={mode}
                  initialFormat={format}
                />
              </div>
            </div>
            <div className="border border-[var(--text-faint)] p-4">
              <p className="font-display text-xl italic">Compare This Repo</p>
              <div className="mt-4 space-y-3">
                {compareTargets.map((entry) => (
                  <a
                    key={`${entry.id}-${entry.target.owner}/${entry.target.repo}`}
                    href={buildComparePath(currentRepo, entry.target, mode, format)}
                    className="block border border-[var(--text-faint)] px-4 py-3 transition-colors hover:border-[var(--text-primary)] hover:bg-[var(--cr-stamp-light)]"
                  >
                    <p className="font-display text-xl italic">{entry.title}</p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {owner}/{repo} vs {entry.target.owner}/{entry.target.repo}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                      {entry.subtitle}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
