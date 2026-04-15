import type { LanguageBarEntry, LanguageEntry, RepoAge } from "@/lib/types";

const REPO_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed
    .replace(/^git@github\.com:/i, "github.com/")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/g, "");

  let path = normalized;

  if (normalized.toLowerCase().startsWith("github.com/")) {
    path = normalized.slice("github.com/".length);
  }

  const segments = path.split("/").filter(Boolean);

  if (segments.length < 2) {
    return null;
  }

  const owner = segments[0];
  const repo = segments[1];

  if (!REPO_SEGMENT.test(owner) || !REPO_SEGMENT.test(repo)) {
    return null;
  }

  return { owner, repo };
}

export function formatRepoAge(createdAt: string): RepoAge {
  const created = new Date(createdAt);
  const now = new Date();

  if (Number.isNaN(created.getTime())) {
    return { years: 0, months: 0 };
  }

  let years = now.getUTCFullYear() - created.getUTCFullYear();
  let months = now.getUTCMonth() - created.getUTCMonth();

  if (now.getUTCDate() < created.getUTCDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
  };
}

export function formatReceiptNumber(repoId: number): string {
  return `#${String(Math.max(0, repoId)).padStart(8, "0")}`;
}

export function buildLanguageBars(languages: LanguageEntry[]): LanguageBarEntry[] {
  return languages.map((language) => {
    return {
      ...language,
      fillPercentage: Math.max(0, Math.min(100, language.percentage)),
      percentageLabel: `${language.percentage.toFixed(1)}%`,
    };
  });
}

export function formatDateUtc(dateString: string | null): string {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute} UTC`;
}

export function formatShortDate(dateString: string | null): string {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatAgeLabel(age: RepoAge): string {
  const years = `${age.years} year${age.years === 1 ? "" : "s"}`;
  const months = `${age.months} month${age.months === 1 ? "" : "s"}`;
  return `${years}, ${months}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
