import Link from "next/link";

import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { deriveMilestones } from "@/lib/milestones";
import type { ReceiptMode, RepoData } from "@/lib/types";

interface ReceiptThumbnailProps {
  href: string;
  data: RepoData;
  label?: string;
  mode?: ReceiptMode;
}

export async function ReceiptThumbnail({ href, data, label, mode = "fine-print" }: ReceiptThumbnailProps) {
  const milestones = deriveMilestones(data).slice(0, 2);

  return (
    <Link
      href={href}
      className="group receipt-thumb-shell transition-transform duration-200 ease-out hover:-translate-y-0.5"
    >
      <div className="receipt-thumb-inner">
        <ReceiptCard data={data} mode={mode} />
      </div>
      {label ? <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">{label}</p> : null}
      {milestones.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {milestones.map((milestone) => (
            <span
              key={milestone.id}
              className="inline-flex min-h-6 items-center border border-[var(--cr-stamp)] px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--cr-stamp)]"
            >
              {milestone.label}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
