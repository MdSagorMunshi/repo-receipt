import { buildLanguageBars, formatAgeLabel, formatCount, formatDateUtc, formatReceiptNumber, formatShortDate } from "@/lib/transform";
import { deriveMilestones } from "@/lib/milestones";
import type { ReceiptMode, RepoData } from "@/lib/types";

export interface ReceiptRow {
  label: string;
  value: string;
  tone?: "default" | "danger";
}

export interface ReceiptViewModel {
  receiptNumber: string;
  generatedAt: string;
  description: string;
  modeLabel: string;
  milestones: string[];
  metrics: ReceiptRow[];
  languages: Array<{ name: string; fillPercentage: number; percentageLabel: string }>;
  activity: ReceiptRow[];
  footerTopics: string[];
  subtotalLabel: string;
  openIssuesLabel: string;
  serviceLine: string;
  fortuneLine: string;
  notes: string[];
}

export function buildReceiptViewModel(data: RepoData, mode: ReceiptMode = "fine-print"): ReceiptViewModel {
  const generatedAt = formatDateUtc(new Date().toISOString());
  const languageLeader = data.languages[0];
  const serviceLine = buildServiceLine(data, languageLeader?.name);
  const fortuneLine = buildFortuneLine(data, mode);
  const notes = buildReceiptNotes(data, languageLeader?.name);

  return {
    receiptNumber: formatReceiptNumber(data.repoId),
    generatedAt,
    description: data.description,
    modeLabel: mode.toUpperCase(),
    milestones: deriveMilestones(data).map((milestone) => milestone.label),
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
    serviceLine,
    fortuneLine,
    notes,
  };
}

function buildServiceLine(data: RepoData, primaryLanguage?: string) {
  if (data.totalCommits >= 50000) {
    return `Chef's table: ${formatCount(data.totalCommits)} commits`;
  }

  if (data.stars >= 100000) {
    return `House special: ${formatCount(data.stars)} stars`;
  }

  if (primaryLanguage) {
    return `House special: ${primaryLanguage}`;
  }

  return `Open seating for ${formatCount(data.contributors)} contributors`;
}

function buildFortuneLine(data: RepoData, mode: ReceiptMode) {
  if (mode === "ledger-noir") {
    return data.openIssues > 1000 ? "Open tabs, open issues, open ambition." : "Balanced books, restless maintainers.";
  }

  if (mode === "archive") {
    return data.repoAge.years >= 10 ? "Filed under durable public artifacts." : "Recently cataloged, already circulating.";
  }

  if (mode === "thermal") {
    return data.totalCommits > 10000 ? "Maintained with dangerous consistency." : "Fresh off the printer, not off the hook.";
  }

  if (data.stars >= 50000) {
    return "The kitchen recommends bragging responsibly.";
  }

  return "Thank you for keeping the source open.";
}

function buildReceiptNotes(data: RepoData, primaryLanguage?: string) {
  const notes = [
    `Most expensive line item: ${formatCount(data.totalCommits)} commits`,
    primaryLanguage ? `House specialty: ${primaryLanguage}` : `House specialty: open source`,
    data.openIssues > 0 ? `Open tab: ${formatCount(data.openIssues)} issues` : "Open tab: settled in full",
  ];

  if (data.repoAge.years >= 10) {
    notes.push("Cellared long enough to qualify as infrastructure.");
  } else if (data.repoAge.years === 0) {
    notes.push("New print run, still smelling like first release.");
  }

  return notes.slice(0, 4);
}
