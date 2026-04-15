import { getRepoGitHubUrl, getRepoStarCount } from "@/lib/github-stars";

function formatStarCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function GitHubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.51-2.69-.97-.09-.24-.48-.97-.82-1.17-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.92-3.64-4.08 0-.9.31-1.64.82-2.22-.08-.21-.36-1.06.08-2.2 0 0 .67-.22 2.2.85A7.38 7.38 0 0 1 8 3.7c.68 0 1.37.09 2.01.27 1.53-1.07 2.2-.85 2.2-.85.44 1.14.16 1.99.08 2.2.51.58.82 1.31.82 2.22 0 3.17-1.87 3.87-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.14.47.55.39A8.23 8.23 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
    </svg>
  );
}

export async function GitHubStarButton() {
  const stars = await getRepoStarCount();

  return (
    <a
      href={getRepoGitHubUrl()}
      target="_blank"
      rel="noreferrer"
      className="fine-link inline-flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]"
    >
      <GitHubMark />
      <span>Give a Star</span>
      {stars !== null ? <span className="text-[var(--text-muted)]">{formatStarCount(stars)}</span> : null}
    </a>
  );
}
