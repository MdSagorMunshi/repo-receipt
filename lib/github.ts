import { formatRepoAge } from "@/lib/transform";
import { RepoFetchError } from "@/lib/types";
import type { GalleryRepoSummary, LanguageEntry, RepoData, RepoMetadataSummary } from "@/lib/types";

const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const DEFAULT_REVALIDATE = 60 * 60 * 24;

let warnedAboutToken = false;

interface GitHubGraphQLError {
  message: string;
  type?: string;
}

interface RepositoryGraphQLNode {
  databaseId: number | null;
  name: string;
  owner: { login: string };
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  watchers: { totalCount: number };
  issues: { totalCount: number };
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
  licenseInfo: { name: string } | null;
  languages: { edges: Array<{ size: number; node: { name: string } }> };
  defaultBranchRef:
    | {
        target:
          | {
              historyLatest: {
                totalCount: number;
                edges: Array<{ node: { committedDate: string } }>;
              };
              historyFirst: {
                edges: Array<{ node: { committedDate: string } }>;
              };
            }
          | null;
      }
    | null;
  createdAt: string;
}

interface RepositoryGraphQLResponse {
  data?: {
    repository: RepositoryGraphQLNode | null;
  };
  errors?: GitHubGraphQLError[];
}

interface RepoMetadataGraphQLResponse {
  data?: {
    repository: {
      owner: { login: string };
      name: string;
      description: string | null;
    } | null;
  };
  errors?: GitHubGraphQLError[];
}

interface SearchRepositoriesResponse {
  items: Array<{
    owner: { login: string };
    name: string;
    full_name: string;
    description: string | null;
    stargazers_count: number;
  }>;
}

type LanguagesResponse = Record<string, number>;

interface CommitWeek {
  days: number[];
}

async function githubFetch(input: string, init?: RequestInit, revalidate = DEFAULT_REVALIDATE) {
  const token = process.env.GITHUB_TOKEN;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("User-Agent", "repo-receipt");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (!warnedAboutToken) {
    console.warn("repo-receipt: GITHUB_TOKEN is not set; falling back to unauthenticated GitHub requests.");
    warnedAboutToken = true;
  }

  const response = await fetch(input, {
    ...init,
    headers,
    next: { revalidate },
  });

  if (response.status === 403 || response.status === 429) {
    const resetSeconds = response.headers.get("x-ratelimit-reset");
    const resetAt = resetSeconds ? new Date(Number(resetSeconds) * 1000).toISOString() : undefined;
    throw new ErrorWithStatus("GitHub rate limit exceeded.", response.status, resetAt);
  }

  if (response.status === 404) {
    throw new ErrorWithStatus("Repository not found.", 404);
  }

  if (!response.ok) {
    throw new ErrorWithStatus(`GitHub request failed with status ${response.status}.`, response.status);
  }

  return response;
}

class ErrorWithStatus extends Error {
  status: number;
  resetAt?: string;

  constructor(message: string, status: number, resetAt?: string) {
    super(message);
    this.status = status;
    this.resetAt = resetAt;
  }
}

function toRepoFetchError(error: unknown): RepoFetchError {
  if (error instanceof RepoFetchError) {
    return error;
  }

  if (error instanceof ErrorWithStatus) {
    return new RepoFetchError(error.message, error.status, error.resetAt);
  }

  if (error instanceof Error) {
    return new RepoFetchError(error.message, 500);
  }

  return new RepoFetchError("Unknown GitHub error.", 500);
}

async function githubGraphql<T>(query: string, variables: Record<string, string>, revalidate = DEFAULT_REVALIDATE) {
  const response = await githubFetch(
    GITHUB_GRAPHQL,
    {
      method: "POST",
      body: JSON.stringify({ query, variables }),
      headers: {
        "Content-Type": "application/json",
      },
    },
    revalidate,
  );

  return (await response.json()) as T;
}

function parseContributorsCount(linkHeader: string | null, fallbackLength: number): number {
  if (!linkHeader) {
    return fallbackLength;
  }

  const match = linkHeader.match(/[\?&]page=(\d+)[^>]*>; rel="last"/);
  return match ? Number(match[1]) : fallbackLength;
}

function buildLanguages(languages: LanguagesResponse): LanguageEntry[] {
  const entries = Object.entries(languages);
  const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (totalBytes === 0) {
    return [];
  }

  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
    }))
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 5);
}

function derivePeakDay(weeks: CommitWeek[] | null): string | null {
  if (!weeks || weeks.length === 0) {
    return null;
  }

  const totals = new Array<number>(7).fill(0);

  for (const week of weeks) {
    week.days.forEach((count, index) => {
      totals[index] += count;
    });
  }

  let peakIndex = 0;

  for (let index = 1; index < totals.length; index += 1) {
    if (totals[index] > totals[peakIndex]) {
      peakIndex = index;
    }
  }

  return totals[peakIndex] === 0 ? null : DAY_NAMES[peakIndex];
}

export async function fetchRepoData(owner: string, repo: string): Promise<RepoData> {
  const query = `
    query RepoReceipt($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        databaseId
        name
        owner { login }
        description
        url
        stargazerCount
        forkCount
        watchers { totalCount }
        issues(states: OPEN) { totalCount }
        repositoryTopics(first: 5) {
          nodes { topic { name } }
        }
        licenseInfo { name }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name }
          }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              historyLatest: history(first: 1) {
                totalCount
                edges { node { committedDate } }
              }
              historyFirst: history(last: 1) {
                edges { node { committedDate } }
              }
            }
          }
        }
        createdAt
      }
    }
  `;

  try {
    const [graph, languagesResponse, commitActivityResponse, contributorsResponse] = await Promise.all([
      githubGraphql<RepositoryGraphQLResponse>(query, { owner, repo }),
      githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`),
      githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/stats/commit_activity`, undefined, DEFAULT_REVALIDATE),
      githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=1&anon=1`, undefined, DEFAULT_REVALIDATE),
    ]);

    if (graph.errors?.length) {
      throw new ErrorWithStatus(graph.errors[0]?.message ?? "GraphQL request failed.", 500);
    }

    const repository = graph.data?.repository;

    if (!repository || repository.databaseId == null) {
      throw new ErrorWithStatus("Repository not found.", 404);
    }

    const languageJson = (await languagesResponse.json()) as LanguagesResponse;
    const commitActivityJson =
      commitActivityResponse.status === 202 ? null : ((await commitActivityResponse.json()) as CommitWeek[]);
    const contributorsJson = (await contributorsResponse.json()) as Array<unknown>;

    const firstCommit =
      repository.defaultBranchRef?.target?.historyFirst.edges[0]?.node.committedDate ?? null;
    const latestCommit =
      repository.defaultBranchRef?.target?.historyLatest.edges[0]?.node.committedDate ?? null;
    const totalCommits = repository.defaultBranchRef?.target?.historyLatest.totalCount ?? 0;

    return {
      name: repository.name,
      owner: repository.owner.login,
      fullName: `${repository.owner.login}/${repository.name}`,
      description: repository.description ?? "No description provided.",
      repoUrl: repository.url,
      stars: repository.stargazerCount,
      forks: repository.forkCount,
      watchers: repository.watchers.totalCount,
      openIssues: repository.issues.totalCount,
      license: repository.licenseInfo?.name ?? "No license",
      topics: repository.repositoryTopics.nodes.map((node) => node.topic.name).slice(0, 5),
      languages: buildLanguages(languageJson),
      firstCommit,
      latestCommit,
      totalCommits,
      contributors: parseContributorsCount(
        contributorsResponse.headers.get("link"),
        contributorsJson.length,
      ),
      peakDay: derivePeakDay(commitActivityJson),
      repoAge: formatRepoAge(repository.createdAt),
      repoId: repository.databaseId,
      createdAt: repository.createdAt,
    };
  } catch (error) {
    throw toRepoFetchError(error);
  }
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoMetadataSummary> {
  const query = `
    query RepoMeta($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        owner { login }
        name
        description
      }
    }
  `;

  try {
    const graph = await githubGraphql<RepoMetadataGraphQLResponse>(query, { owner, repo });

    if (graph.errors?.length) {
      throw new ErrorWithStatus(graph.errors[0]?.message ?? "GraphQL request failed.", 500);
    }

    const repository = graph.data?.repository;

    if (!repository) {
      throw new ErrorWithStatus("Repository not found.", 404);
    }

    return {
      fullName: `${repository.owner.login}/${repository.name}`,
      description: repository.description ?? "Generate a receipt for this repository.",
    };
  } catch (error) {
    throw toRepoFetchError(error);
  }
}

export async function fetchGalleryRepos(): Promise<GalleryRepoSummary[]> {
  const query = encodeURIComponent("stars:>10000 archived:false mirror:false");

  try {
    const response = await githubFetch(
      `${GITHUB_API}/search/repositories?q=${query}&sort=stars&order=desc&per_page=20`,
      undefined,
      60 * 60 * 24 * 7,
    );
    const json = (await response.json()) as SearchRepositoriesResponse;

    return json.items.map((item) => ({
      owner: item.owner.login,
      repo: item.name,
      fullName: item.full_name,
      description: item.description ?? "Open-source repository",
      stars: item.stargazers_count,
    }));
  } catch (error) {
    throw toRepoFetchError(error);
  }
}
