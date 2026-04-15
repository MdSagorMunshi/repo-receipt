export type ThemeMode = "light" | "dark";

export interface LanguageEntry {
  name: string;
  percentage: number;
  bytes: number;
}

export interface LanguageBarEntry extends LanguageEntry {
  bar: string;
  percentageLabel: string;
}

export interface RepoAge {
  years: number;
  months: number;
}

export interface RepoData {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  repoUrl: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  license: string;
  topics: string[];
  languages: LanguageEntry[];
  firstCommit: string | null;
  latestCommit: string | null;
  totalCommits: number;
  contributors: number;
  peakDay: string | null;
  repoAge: RepoAge;
  repoId: number;
  createdAt: string;
}

export interface RepoMetadataSummary {
  fullName: string;
  description: string;
}

export interface GalleryRepoSummary {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
}

export class RepoFetchError extends Error {
  status: number;
  resetAt?: string;

  constructor(message: string, status: number, resetAt?: string) {
    super(message);
    this.name = "RepoFetchError";
    this.status = status;
    this.resetAt = resetAt;
  }
}
