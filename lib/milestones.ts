import type { RepoData } from "@/lib/types";

export interface ReceiptMilestone {
  id: string;
  label: string;
}

export interface MilestoneSummary {
  id: string;
  label: string;
  count: number;
}

export function deriveMilestones(data: RepoData): ReceiptMilestone[] {
  const milestones: ReceiptMilestone[] = [];

  if (data.stars >= 100000) {
    milestones.push({ id: "stars-100k", label: "Six Figure Tab" });
  } else if (data.stars >= 10000) {
    milestones.push({ id: "stars-10k", label: "Ten Thousand Stars" });
  } else if (data.stars >= 1000) {
    milestones.push({ id: "stars-1k", label: "Four Digit Favorite" });
  } else if (data.stars >= 100) {
    milestones.push({ id: "stars-100", label: "First Hundred Served" });
  }

  if (data.totalCommits >= 50000) {
    milestones.push({ id: "commits-50k", label: "Long Service Kitchen" });
  } else if (data.totalCommits >= 10000) {
    milestones.push({ id: "commits-10k", label: "Busy Line" });
  }

  if (data.contributors >= 1000) {
    milestones.push({ id: "contributors-1k", label: "Thousand Seat Staff" });
  } else if (data.contributors >= 100) {
    milestones.push({ id: "contributors-100", label: "Crowded Dining Room" });
  }

  if (data.repoAge.years >= 10) {
    milestones.push({ id: "age-10y", label: "Cellared A Decade" });
  } else if (data.repoAge.years >= 5) {
    milestones.push({ id: "age-5y", label: "House Vintage" });
  }

  if (data.openIssues === 0) {
    milestones.push({ id: "issues-0", label: "Closed Tab" });
  }

  return milestones.slice(0, 4);
}

export function summarizeMilestones(repos: RepoData[]): MilestoneSummary[] {
  const counts = new Map<string, MilestoneSummary>();

  for (const repo of repos) {
    for (const milestone of deriveMilestones(repo)) {
      const existing = counts.get(milestone.id);

      if (existing) {
        existing.count += 1;
      } else {
        counts.set(milestone.id, {
          id: milestone.id,
          label: milestone.label,
          count: 1,
        });
      }
    }
  }

  return [...counts.values()].sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}
