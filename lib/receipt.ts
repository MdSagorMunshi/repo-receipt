import { buildLanguageBars, formatAgeLabel, formatCount, formatDateUtc, formatReceiptNumber, formatShortDate } from "@/lib/transform";
import type { RepoData } from "@/lib/types";

export interface ReceiptRow {
  label: string;
  value: string;
  tone?: "default" | "danger";
}

export interface ReceiptViewModel {
  receiptNumber: string;
  generatedAt: string;
  description: string;
  metrics: ReceiptRow[];
  languages: Array<{ name: string; fillPercentage: number; percentageLabel: string }>;
  activity: ReceiptRow[];
  footerTopics: string[];
  subtotalLabel: string;
  openIssuesLabel: string;
}

export function buildReceiptViewModel(data: RepoData): ReceiptViewModel {
  const generatedAt = formatDateUtc(new Date().toISOString());

  return {
    receiptNumber: formatReceiptNumber(data.repoId),
    generatedAt,
    description: data.description,
    metrics: [
      { label: "STARS", value: formatCount(data.stars) },
      { label: "FORKS", value: formatCount(data.forks) },
      { label: "WATCHERS", value: formatCount(data.watchers) },
      { label: "OPEN ISSUES", value: formatCount(data.openIssues), tone: "danger" },
    ],
    languages: buildLanguageBars(data.languages).map((language) => ({
      name: language.name,
      fillPercentage: language.fillPercentage,
      percentageLabel: language.percentageLabel,
    })),
    activity: [
      { label: "FIRST COMMIT", value: formatShortDate(data.firstCommit) },
      { label: "LATEST COMMIT", value: formatShortDate(data.latestCommit) },
      { label: "REPO AGE", value: formatAgeLabel(data.repoAge) },
      { label: "TOTAL COMMITS", value: data.totalCommits > 0 ? formatCount(data.totalCommits) : "—" },
      { label: "CONTRIBUTORS", value: formatCount(data.contributors) },
      { label: "PEAK DAY", value: data.peakDay ?? "—" },
    ],
    footerTopics: data.topics.slice(0, 5).map((topic) => `#${topic}`),
    subtotalLabel: `SUBTOTAL ${formatCount(data.stars)}`,
    openIssuesLabel: `OPEN ISSUES ${formatCount(data.openIssues)}`,
  };
}
