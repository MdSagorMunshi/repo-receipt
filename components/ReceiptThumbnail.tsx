import Link from "next/link";

import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import type { RepoData } from "@/lib/types";

interface ReceiptThumbnailProps {
  href: string;
  data: RepoData;
  label?: string;
}

export async function ReceiptThumbnail({ href, data, label }: ReceiptThumbnailProps) {
  return (
    <Link
      href={href}
      className="group receipt-thumb-shell transition-transform duration-200 ease-out hover:-translate-y-0.5"
    >
      <div className="receipt-thumb-inner">
        <ReceiptCard data={data} />
      </div>
      {label ? <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">{label}</p> : null}
    </Link>
  );
}
