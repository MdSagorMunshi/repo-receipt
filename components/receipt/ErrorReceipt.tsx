import Link from "next/link";

interface ErrorReceiptProps {
  repoLabel: string;
  message: string;
}

export function ErrorReceipt({ repoLabel, message }: ErrorReceiptProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <div className="receipt-card paper-texture w-full max-w-[480px] px-6 py-8">
        <div className="relative z-10 text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">REPO-RECEIPT</p>
          <div className="mt-4 border-b border-dashed border-[var(--text-faint)] pb-4">
            <p className="font-display text-[34px] leading-[1.05]">{repoLabel}</p>
          </div>
          <div
            className="mt-6 flex min-h-40 items-center justify-center border-2 border-[var(--cr-danger)] text-[44px] font-medium tracking-[0.16em] text-[var(--cr-danger)]"
            style={{ transform: "rotate(-8deg)" }}
          >
            <span className="font-mono">VOID</span>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[var(--page-bg)]"
          style={{ clipPath: "polygon(0 34%, 100% 0, 100% 100%, 0 100%)" }}
        />
      </div>
      <p className="mt-8 max-w-xl font-mono text-sm text-[var(--text-muted)]">{message}</p>
      <Link href="/" className="mt-6 fine-link px-5">
        Try another repo
      </Link>
    </div>
  );
}
