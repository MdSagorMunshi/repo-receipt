import type { Metadata } from "next";
import Link from "next/link";

import { CompareActionPanel } from "@/components/CompareActionPanel";
import { CompareInputForm } from "@/components/CompareInputForm";
import { SiteHeader } from "@/components/SiteHeader";
import { CompareDisplayShell } from "@/components/compare/CompareDisplayShell";
import { createProtectedComparePath } from "@/lib/api-signing";
import { buildCompareGeneratePath, buildComparePath, type CompareRepoRef } from "@/lib/compare-routes";
import { featuredCompares } from "@/lib/featured-compares";
import { fetchRepoData, fetchRepoMetadata } from "@/lib/github";
import { getReceiptFormat, getReceiptFormatDefinition } from "@/lib/receipt-formats";
import { getReceiptMode, getReceiptModeDefinition } from "@/lib/receipt-modes";
import { getAppName, getSiteUrl } from "@/lib/site";
import { parseRepoUrl, truncateText } from "@/lib/transform";
import { RepoFetchError } from "@/lib/types";

export const revalidate = 86400;

interface ComparePageProps {
  searchParams?: Promise<{
    left?: string;
    right?: string;
    mode?: string;
    format?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ComparePageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const appName = getAppName();
  const left = parseRepoUrl(resolvedSearchParams.left ?? "");
  const right = parseRepoUrl(resolvedSearchParams.right ?? "");
  const mode = getReceiptMode(resolvedSearchParams.mode);
  const format = getReceiptFormat(resolvedSearchParams.format);

  if (!left || !right) {
    return {
      title: `Compare repos on ${appName}`,
      description: "Split the bill between two public GitHub repositories and compare their open-source weight.",
    };
  }

  try {
    const [leftMetadata, rightMetadata] = await Promise.all([
      fetchRepoMetadata(left.owner, left.repo),
      fetchRepoMetadata(right.owner, right.repo),
    ]);
    const imagePath = buildCompareGeneratePath(left, right, mode, format);

    return {
      title: `${leftMetadata.fullName} vs ${rightMetadata.fullName} on ${appName}`,
      description: truncateText(
        `Split the bill between ${leftMetadata.fullName} and ${rightMetadata.fullName}.`,
        160,
      ),
      openGraph: {
        title: `${leftMetadata.fullName} vs ${rightMetadata.fullName} on ${appName}`,
        description: truncateText(
          `Split the bill between ${leftMetadata.fullName} and ${rightMetadata.fullName}.`,
          160,
        ),
        images: [imagePath],
      },
      twitter: {
        card: "summary_large_image",
        title: `${leftMetadata.fullName} vs ${rightMetadata.fullName} on ${appName}`,
        description: truncateText(
          `Split the bill between ${leftMetadata.fullName} and ${rightMetadata.fullName}.`,
          160,
        ),
        images: [imagePath],
      },
    };
  } catch {
    return {
      title: `${left.owner}/${left.repo} vs ${right.owner}/${right.repo} on ${appName}`,
      description: "Split the bill between two public GitHub repositories.",
    };
  }
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const left = parseRepoUrl(resolvedSearchParams.left ?? "");
  const right = parseRepoUrl(resolvedSearchParams.right ?? "");
  const mode = getReceiptMode(resolvedSearchParams.mode);
  const format = getReceiptFormat(resolvedSearchParams.format);
  let data:
    | {
        leftData: Awaited<ReturnType<typeof fetchRepoData>>;
        rightData: Awaited<ReturnType<typeof fetchRepoData>>;
      }
    | null = null;
  let fetchError: unknown = null;

  if (!left || !right) {
    return <CompareLanding mode={mode} format={format} />;
  }

  try {
    const [leftData, rightData] = await Promise.all([
      fetchRepoData(left.owner, left.repo),
      fetchRepoData(right.owner, right.repo),
    ]);
    data = { leftData, rightData };
  } catch (error) {
    fetchError = error;
  }

  if (fetchError) {
    let message = "The compare press hit a fault while assembling the split bill. Try again in a moment.";

    if (fetchError instanceof RepoFetchError) {
      if (fetchError.status === 429) {
        message = "GitHub's API is taking a breather. Try this comparison again in a few minutes.";
      } else if (fetchError.status >= 500) {
        message = "GitHub returned an unexpected response while assembling one side of this split bill.";
      } else {
        message = "One of those repositories could not be found or is private.";
      }
    }

    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Split-Bill Error</p>
          <h1 className="mt-5 font-display text-4xl italic">This table could not be settled.</h1>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-7 text-[var(--text-muted)]">{message}</p>
          <div className="mt-10 w-full max-w-3xl border border-[var(--text-faint)] p-5 text-left">
            <CompareInputForm
              initialLeft={resolvedSearchParams.left ?? ""}
              initialRight={resolvedSearchParams.right ?? ""}
              initialMode={mode}
              initialFormat={format}
            />
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return <CompareLanding mode={mode} format={format} />;
  }

  return (
    <CompareResult
      left={left}
      right={right}
      leftData={data.leftData}
      rightData={data.rightData}
      mode={mode}
      format={format}
    />
  );
}

function CompareLanding({
  mode,
  format,
}: {
  mode: ReturnType<typeof getReceiptMode>;
  format: ReturnType<typeof getReceiptFormat>;
}) {
  const modeDefinition = getReceiptModeDefinition(mode);
  const formatDefinition = getReceiptFormatDefinition(format);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-12 py-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:py-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Compare Two Repos</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] tracking-[-0.05em] sm:text-6xl">
              Split the bill between two open-source tabs.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-muted)]">
              Put two public GitHub repositories on the same check and see which project carries the heavier stars,
              commits, contributors, and open issues.
            </p>
            <p className="mt-4 max-w-3xl font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Active mode: {modeDefinition.label} · Default format ready: {formatDefinition.label}
            </p>
            <div className="mt-10 max-w-4xl border border-[var(--text-faint)] p-5">
              <CompareInputForm initialMode={mode} initialFormat={format} />
            </div>
          </div>
          <div className="border border-[var(--text-faint)] p-5">
            <p className="font-display text-2xl italic">Suggested tables</p>
            <div className="mt-5 space-y-4">
              {featuredCompares.map((pair) => (
                <Link
                  key={pair.id}
                  href={buildComparePath(pair.left, pair.right, mode, format)}
                  className="block border border-[var(--text-faint)] px-4 py-3 transition-colors hover:border-[var(--text-primary)] hover:bg-[var(--cr-stamp-light)]"
                >
                  <p className="font-display text-2xl italic">{pair.title}</p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {pair.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

async function CompareResult({
  left,
  right,
  leftData,
  rightData,
  mode,
  format,
}: {
  left: CompareRepoRef;
  right: CompareRepoRef;
  leftData: Awaited<ReturnType<typeof fetchRepoData>>;
  rightData: Awaited<ReturnType<typeof fetchRepoData>>;
  mode: ReturnType<typeof getReceiptMode>;
  format: ReturnType<typeof getReceiptFormat>;
}) {
  const siteUrl = getSiteUrl();
  const comparePath = buildComparePath(left, right, mode, format);
  const compareUrl = new URL(comparePath, siteUrl).toString();
  const imageUrl = new URL(buildCompareGeneratePath(left, right, mode, format), siteUrl).toString();
  const downloadPath = createProtectedComparePath(left, right, mode, format);
  const embedCode = `[![repo-receipt compare](${imageUrl})](${compareUrl})`;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,920px)_minmax(320px,420px)] xl:justify-center">
          <CompareDisplayShell left={leftData} right={rightData} compareUrl={compareUrl} mode={mode} format={format} />
          <div className="flex flex-col gap-6">
            <CompareActionPanel
              left={left}
              right={right}
              leftStars={leftData.stars}
              rightStars={rightData.stars}
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
              <p className="font-display text-xl italic">Settle another pair</p>
              <div className="mt-4">
                <CompareInputForm
                  initialLeft={`${left.owner}/${left.repo}`}
                  initialRight={`${right.owner}/${right.repo}`}
                  initialMode={mode}
                  initialFormat={format}
                  compact
                />
              </div>
            </div>
            <div className="border border-[var(--text-faint)] p-4">
              <p className="font-display text-xl italic">House Matchups</p>
              <div className="mt-4 space-y-3">
                {featuredCompares
                  .filter(
                    (entry) =>
                      !(
                        entry.left.owner === left.owner &&
                        entry.left.repo === left.repo &&
                        entry.right.owner === right.owner &&
                        entry.right.repo === right.repo
                      ),
                  )
                  .slice(0, 3)
                  .map((entry) => (
                    <Link
                      key={entry.id}
                      href={buildComparePath(entry.left, entry.right, mode, format)}
                      className="block border border-[var(--text-faint)] px-4 py-3 transition-colors hover:border-[var(--text-primary)] hover:bg-[var(--cr-stamp-light)]"
                    >
                      <p className="font-display text-xl italic">{entry.title}</p>
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {entry.subtitle}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
