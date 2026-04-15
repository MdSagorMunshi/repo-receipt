const GITHUB_REPO_URL = "https://github.com/MdSagorMunshi/repo-receipt";
const GITHUB_REPO_API = "https://api.github.com/repos/MdSagorMunshi/repo-receipt";
const STAR_REVALIDATE_SECONDS = 60 * 30;

interface RepoStarResponse {
  stargazers_count?: number;
}

function getGitHubHeaders() {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": "repo-receipt",
  });
  const token = process.env.GITHUB_TOKEN?.trim();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function fetchLiveStarCount() {
  const response = await fetch(GITHUB_REPO_API, {
    headers: getGitHubHeaders(),
    next: { revalidate: STAR_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RepoStarResponse;
  return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
}

export async function getRepoStarCount() {
  try {
    return await fetchLiveStarCount();
  } catch {
    return null;
  }
}

export function getRepoGitHubUrl() {
  return GITHUB_REPO_URL;
}
