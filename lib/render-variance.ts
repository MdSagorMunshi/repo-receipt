import type { ReceiptMode, RepoData } from "@/lib/types";

export interface PaperVariance {
  docketLabel: string;
  stampLabel: string;
  stampTone: "stamp" | "muted" | "danger";
  stampTop: number;
  stampLeft: number;
  stampWidth: number;
  foldLines: number[];
}

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickFrom<T>(items: T[], seed: number) {
  return items[seed % items.length];
}

export function buildReceiptVariance(data: RepoData, mode: ReceiptMode): PaperVariance {
  const seed = hashString(`${data.repoId}:${mode}:${data.fullName}`);

  return {
    docketLabel: `DKT-${String((seed % 9000) + 1000)}`,
    stampLabel: resolveReceiptStamp(data, seed),
    stampTone: resolveReceiptStampTone(data),
    stampTop: 168 + (seed % 72),
    stampLeft: 196 + (seed % 36),
    stampWidth: 148 + (seed % 28),
    foldLines: [262 + (seed % 48), 702 + ((seed >> 4) % 56)],
  };
}

export function buildCompareVariance(left: RepoData, right: RepoData, mode: ReceiptMode): PaperVariance {
  const seed = hashString(`${left.repoId}:${right.repoId}:${mode}`);

  return {
    docketLabel: `CHK-${String((seed % 9000) + 1000)}`,
    stampLabel: pickFrom(
      ["SPLIT CHECK", "HEAD TO HEAD", "DOUBLE ORDER", "SIDE BY SIDE", "TASTING MENU"],
      seed,
    ),
    stampTone: left.openIssues + right.openIssues > 5000 ? "danger" : "stamp",
    stampTop: 190 + (seed % 72),
    stampLeft: 430 + (seed % 60),
    stampWidth: 190 + (seed % 36),
    foldLines: [298 + (seed % 60), 812 + ((seed >> 5) % 72)],
  };
}

function resolveReceiptStamp(data: RepoData, seed: number) {
  if (data.openIssues === 0) {
    return "SETTLED TAB";
  }

  if (data.stars >= 100000) {
    return "HOUSE FAVORITE";
  }

  if (data.repoAge.years >= 10) {
    return "ARCHIVE COPY";
  }

  if (data.totalCommits >= 10000) {
    return "LONG SERVICE";
  }

  return pickFrom(["CHEF'S PICK", "WEEKLY SPECIAL", "FILED COPY", "OPEN SOURCE"], seed);
}

function resolveReceiptStampTone(data: RepoData): PaperVariance["stampTone"] {
  if (data.openIssues >= 2000) {
    return "danger";
  }

  if (data.repoAge.years >= 10) {
    return "muted";
  }

  return "stamp";
}
