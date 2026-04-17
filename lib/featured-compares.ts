import type { CompareRepoRef } from "@/lib/compare-routes";

export interface FeaturedCompare {
  id: string;
  title: string;
  subtitle: string;
  left: CompareRepoRef;
  right: CompareRepoRef;
}

export interface FeaturedCompareTarget {
  id: string;
  title: string;
  subtitle: string;
  target: CompareRepoRef;
}

export const featuredCompares: FeaturedCompare[] = [
  {
    id: "react-vs-next",
    title: "Framework Royalty",
    subtitle: "facebook/react vs vercel/next.js",
    left: { owner: "facebook", repo: "react" },
    right: { owner: "vercel", repo: "next.js" },
  },
  {
    id: "vscode-vs-typescript",
    title: "Microsoft Double Bill",
    subtitle: "microsoft/vscode vs microsoft/TypeScript",
    left: { owner: "microsoft", repo: "vscode" },
    right: { owner: "microsoft", repo: "TypeScript" },
  },
  {
    id: "linux-vs-kubernetes",
    title: "Infrastructure Table",
    subtitle: "torvalds/linux vs kubernetes/kubernetes",
    left: { owner: "torvalds", repo: "linux" },
    right: { owner: "kubernetes", repo: "kubernetes" },
  },
  {
    id: "rails-vs-django",
    title: "Web Classics",
    subtitle: "rails/rails vs django/django",
    left: { owner: "rails", repo: "rails" },
    right: { owner: "django", repo: "django" },
  },
];

export function getFeaturedCompareTargets(current?: CompareRepoRef) {
  const seen = new Set<string>();
  const targets: FeaturedCompareTarget[] = [];

  for (const compare of featuredCompares) {
    for (const candidate of [compare.left, compare.right]) {
      const key = `${candidate.owner}/${candidate.repo}`;

      if (current && current.owner === candidate.owner && current.repo === candidate.repo) {
        continue;
      }

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      targets.push({
        id: compare.id,
        title: compare.title,
        subtitle: compare.subtitle,
        target: candidate,
      });
    }
  }

  return targets;
}
