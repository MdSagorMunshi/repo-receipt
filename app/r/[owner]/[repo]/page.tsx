import type { Metadata } from "next";

import { ActionPanel } from "@/components/ActionPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { UrlInputForm } from "@/components/UrlInputForm";
import { ErrorReceipt } from "@/components/receipt/ErrorReceipt";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { fetchRepoData, fetchRepoMetadata } from "@/lib/github";
import { getAppName, getSiteUrl } from "@/lib/site";
import { formatAgeLabel, truncateText } from "@/lib/transform";
import { RepoFetchError } from "@/lib/types";

export const revalidate = 86400;

interface ReceiptPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function generateMetadata({ params }: ReceiptPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const appName = getAppName();

  try {
    const metadata = await fetchRepoMetadata(owner, repo);

    return {
      title: `${metadata.fullName} on ${appName}`,
      description: truncateText(metadata.description, 160),
      openGraph: {
        title: `${metadata.fullName} on ${appName}`,
        description: truncateText(metadata.description, 160),
        images: [`/api/generate/${owner}/${repo}`],
      },
      twitter: {
        card: "summary_large_image",
        title: `${metadata.fullName} on ${appName}`,
        description: truncateText(metadata.description, 160),
        images: [`/api/generate/${owner}/${repo}`],
      },
    };
  } catch {
    return {
      title: `${owner}/${repo} on ${appName}`,
      description: "Generate a beautiful, shareable receipt for this public GitHub repository.",
    };
  }
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { owner, repo } = await params;
  const siteUrl = getSiteUrl();

  try {
    const data = await fetchRepoData(owner, repo);
    const imageUrl = new URL(`/api/generate/${owner}/${repo}`, siteUrl).toString();
    const receiptUrl = new URL(`/r/${owner}/${repo}`, siteUrl).toString();
    const embedCode = `[![repo-receipt](${imageUrl})](${receiptUrl})`;

    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[480px_minmax(320px,420px)] xl:justify-center">
            <ReceiptCard data={data} />
            <div className="flex flex-col gap-6">
              <ActionPanel
                owner={owner}
                repo={repo}
                stars={data.stars}
                commitCount={data.totalCommits}
                repoAgeLabel={formatAgeLabel(data.repoAge)}
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
                  <UrlInputForm initialValue={`${owner}/${repo}`} compact />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    if (error instanceof RepoFetchError) {
      if (error.status === 429) {
        const resetLabel = error.resetAt ? ` Rate limit resets at ${error.resetAt}.` : "";
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
}
