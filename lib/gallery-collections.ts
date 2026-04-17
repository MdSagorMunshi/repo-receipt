import { deriveMilestones } from "@/lib/milestones";
import type { RepoData } from "@/lib/types";

export interface GalleryCollection {
  id: string;
  title: string;
  description: string;
  repos: RepoData[];
}

function pickUnique(
  repos: RepoData[],
  used: Set<string>,
  predicate: (repo: RepoData) => boolean,
  sort: (left: RepoData, right: RepoData) => number,
  limit: number,
) {
  const selected = repos
    .filter((repo) => !used.has(repo.fullName))
    .filter(predicate)
    .sort(sort)
    .slice(0, limit);

  selected.forEach((repo) => used.add(repo.fullName));
  return selected;
}

export function buildGalleryCollections(repos: RepoData[]): GalleryCollection[] {
  const used = new Set<string>();

  const collections: GalleryCollection[] = [];

  const featuredMarks = pickUnique(
    repos,
    used,
    (repo) => deriveMilestones(repo).length >= 2,
    (left, right) =>
      deriveMilestones(right).length - deriveMilestones(left).length || right.stars - left.stars,
    6,
  );

  if (featuredMarks.length > 0) {
    collections.push({
      id: "featured-marks",
      title: "Featured Marks",
      description: "Repos carrying the strongest mix of badges, age, and service history.",
      repos: featuredMarks,
    });
  }

  const decorated = pickUnique(
    repos,
    used,
    () => true,
    (left, right) => right.stars - left.stars,
    8,
  );

  if (decorated.length > 0) {
    collections.push({
      id: "decorated",
      title: "Most Decorated",
      description: "The house favorites with the largest star tabs.",
      repos: decorated,
    });
  }

  const vintages = pickUnique(
    repos,
    used,
    (repo) => repo.repoAge.years >= 8,
    (left, right) =>
      right.repoAge.years - left.repoAge.years ||
      right.repoAge.months - left.repoAge.months ||
      right.stars - left.stars,
    6,
  );

  if (vintages.length > 0) {
    collections.push({
      id: "vintages",
      title: "House Vintages",
      description: "Cellared long enough to become part of the furniture.",
      repos: vintages,
    });
  }

  const busyLine = pickUnique(
    repos,
    used,
    (repo) => repo.totalCommits >= 10000 || repo.contributors >= 200,
    (left, right) => right.totalCommits - left.totalCommits || right.contributors - left.contributors,
    6,
  );

  if (busyLine.length > 0) {
    collections.push({
      id: "busy-line",
      title: "Busy Line",
      description: "Projects running the loudest kitchen with the biggest staff.",
      repos: busyLine,
    });
  }

  const settledTabs = pickUnique(
    repos,
    used,
    (repo) => repo.openIssues === 0,
    (left, right) => right.stars - left.stars,
    4,
  );

  if (settledTabs.length > 0) {
    collections.push({
      id: "settled-tabs",
      title: "Settled Tabs",
      description: "Receipts with no open issue tab left on the table.",
      repos: settledTabs,
    });
  }

  const leftovers = repos.filter((repo) => !used.has(repo.fullName)).slice(0, 6);

  if (leftovers.length > 0) {
    collections.push({
      id: "fresh-pours",
      title: "Fresh Pours",
      description: "Everything else worth pulling off the shelf this week.",
      repos: leftovers,
    });
  }

  return collections;
}
