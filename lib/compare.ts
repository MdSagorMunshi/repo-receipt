import { buildLanguageBars, formatAgeLabel, formatCount, formatDateUtc, formatReceiptNumber } from "@/lib/transform";
import type { ReceiptMode, RepoData } from "@/lib/types";

export interface CompareReceiptRow {
  label: string;
  left: string;
  right: string;
  lead: string;
  tone?: "default" | "danger";
}

export interface CompareReceiptViewModel {
  generatedAt: string;
  modeLabel: string;
  leftReceiptNumber: string;
  rightReceiptNumber: string;
  rows: CompareReceiptRow[];
  leftLanguages: Array<{ name: string; fillPercentage: number; percentageLabel: string }>;
  rightLanguages: Array<{ name: string; fillPercentage: number; percentageLabel: string }>;
  notes: string[];
  subtotalStarsLabel: string;
  subtotalCommitsLabel: string;
  serviceLine: string;
  fortuneLine: string;
}

export function buildCompareReceiptViewModel(
  left: RepoData,
  right: RepoData,
  mode: ReceiptMode = "fine-print",
): CompareReceiptViewModel {
  const generatedAt = formatDateUtc(new Date().toISOString());
  const leftPrimaryLanguage = left.languages[0]?.name ?? "Open Source";
  const rightPrimaryLanguage = right.languages[0]?.name ?? "Open Source";

  return {
    generatedAt,
    modeLabel: mode.toUpperCase(),
    leftReceiptNumber: formatReceiptNumber(left.repoId),
    rightReceiptNumber: formatReceiptNumber(right.repoId),
    rows: [
      buildNumericRow("STARS", left.stars, right.stars),
      buildNumericRow("FORKS", left.forks, right.forks),
      buildNumericRow("WATCHERS", left.watchers, right.watchers),
      buildNumericRow("COMMITS", left.totalCommits, right.totalCommits),
      buildNumericRow("CONTRIBUTORS", left.contributors, right.contributors),
      buildNumericRow("OPEN ISSUES", left.openIssues, right.openIssues, {
        lowerWins: true,
        tone: "danger",
      }),
      buildAgeRow(left, right),
    ],
    leftLanguages: buildLanguageBars(left.languages).slice(0, 3),
    rightLanguages: buildLanguageBars(right.languages).slice(0, 3),
    notes: buildCompareNotes(left, right, leftPrimaryLanguage, rightPrimaryLanguage),
    subtotalStarsLabel: `SUBTOTAL ${formatCount(left.stars + right.stars)} stars`,
    subtotalCommitsLabel: `SERVICE ${formatCount(left.totalCommits + right.totalCommits)} commits`,
    serviceLine: buildServiceLine(left, right),
    fortuneLine: buildFortuneLine(left, right, mode),
  };
}

function buildNumericRow(
  label: string,
  leftValue: number,
  rightValue: number,
  options?: { lowerWins?: boolean; tone?: "default" | "danger" },
): CompareReceiptRow {
  const lowerWins = options?.lowerWins ?? false;

  return {
    label,
    left: formatCount(leftValue),
    right: formatCount(rightValue),
    lead: buildLeadLabel(leftValue, rightValue, lowerWins),
    tone: options?.tone,
  };
}

function buildAgeRow(left: RepoData, right: RepoData): CompareReceiptRow {
  const leftMonths = left.repoAge.years * 12 + left.repoAge.months;
  const rightMonths = right.repoAge.years * 12 + right.repoAge.months;

  return {
    label: "AGE",
    left: formatAgeLabel(left.repoAge),
    right: formatAgeLabel(right.repoAge),
    lead:
      leftMonths === rightMonths
        ? "TIED"
        : leftMonths > rightMonths
          ? "LEFT older"
          : "RIGHT older",
  };
}

function buildLeadLabel(leftValue: number, rightValue: number, lowerWins: boolean) {
  if (leftValue === rightValue) {
    return "TIED";
  }

  const leftWins = lowerWins ? leftValue < rightValue : leftValue > rightValue;
  const delta = Math.abs(leftValue - rightValue);

  if (lowerWins) {
    return `${leftWins ? "LEFT" : "RIGHT"} ${formatCount(delta)} fewer`;
  }

  return `${leftWins ? "LEFT" : "RIGHT"} +${formatCount(delta)}`;
}

function buildCompareNotes(
  left: RepoData,
  right: RepoData,
  leftPrimaryLanguage: string,
  rightPrimaryLanguage: string,
) {
  const starsLeader = left.stars === right.stars ? "Dead heat on stars." : `${getRepoLeader(left, right, "stars")} carries the heavier tab.`;
  const commitsLeader =
    left.totalCommits === right.totalCommits
      ? "Both kitchens logged the same amount of service."
      : `${getRepoLeader(left, right, "totalCommits")} ran the busier line.`;
  const issueLeader =
    left.openIssues === right.openIssues
      ? "Both tables left the same open tab."
      : `${getRepoLowerLeader(left, right, "openIssues")} closes cleaner on open issues.`;

  return [
    starsLeader,
    commitsLeader,
    `${left.fullName} pours ${leftPrimaryLanguage}; ${right.fullName} pours ${rightPrimaryLanguage}.`,
    issueLeader,
  ];
}

function buildServiceLine(left: RepoData, right: RepoData) {
  return `Split bill: ${left.fullName} × ${right.fullName}`;
}

function buildFortuneLine(left: RepoData, right: RepoData, mode: ReceiptMode) {
  if (mode === "ledger-noir") {
    return "Two ledgers, one public balance sheet.";
  }

  if (mode === "archive") {
    return "Filed as a comparative record of open-source appetite.";
  }

  if (mode === "thermal") {
    return "Fresh off the printer, still warm from the argument.";
  }

  if (left.stars === right.stars) {
    return "A dead-even split is still a good night out.";
  }

  return "One bill, two repos, plenty to brag about.";
}

function getRepoLeader(left: RepoData, right: RepoData, key: "stars" | "totalCommits" | "openIssues") {
  return left[key] >= right[key] ? left.fullName : right.fullName;
}

function getRepoLowerLeader(left: RepoData, right: RepoData, key: "openIssues") {
  return left[key] <= right[key] ? left.fullName : right.fullName;
}
