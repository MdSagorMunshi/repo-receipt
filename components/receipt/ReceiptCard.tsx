/* eslint-disable @next/next/no-img-element */

import { buildReceiptViewModel } from "@/lib/receipt";
import { buildReceiptVariance } from "@/lib/render-variance";
import { getReceiptModeDefinition } from "@/lib/receipt-modes";
import { createQrDataUri } from "@/lib/qr";
import { getSiteHost } from "@/lib/site";
import type { ReceiptMode, RepoData } from "@/lib/types";

interface ReceiptCardProps {
  data: RepoData;
  className?: string;
  mode?: ReceiptMode;
}

export async function ReceiptCard({ data, className = "", mode = "fine-print" }: ReceiptCardProps) {
  const receipt = buildReceiptViewModel(data, mode);
  const variance = buildReceiptVariance(data, mode);
  const modeDefinition = getReceiptModeDefinition(mode);
  const qrDataUri = await createQrDataUri(data.repoUrl);
  const siteHost = getSiteHost();

  return (
    <article className={`receipt-card paper-texture ${modeDefinition.cardClassName} px-6 py-7 ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="paper-docket" style={{ top: 16, right: 16 }}>
          {variance.docketLabel}
        </div>
        {variance.foldLines.map((foldLine) => (
          <div key={foldLine} className="paper-fold-line" style={{ top: `${foldLine}px` }} />
        ))}
        <div
          className={`paper-stamp paper-stamp-${variance.stampTone}`}
          style={{
            top: `${variance.stampTop}px`,
            left: `${variance.stampLeft}px`,
            width: `${variance.stampWidth}px`,
          }}
        >
          {variance.stampLabel}
        </div>
      </div>
      <div className="relative z-10">
        <header className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            REPO-RECEIPT
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-faint)]">
            {receipt.modeLabel}
          </p>
          <p className="mt-3 font-mono text-xs tracking-[0.08em]">{receipt.receiptNumber}</p>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">{receipt.generatedAt}</p>
        </header>

        <hr className="receipt-divider my-5" />

        <section>
          <h2 className="font-display text-[35px] leading-[1.03] tracking-[-0.03em]">{data.fullName}</h2>
          <p className="mt-3 font-mono text-[12px] leading-5 text-[var(--text-muted)]">
            {receipt.description}
          </p>
          {receipt.milestones.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {receipt.milestones.map((milestone) => (
                <span
                  key={milestone}
                  className="inline-flex min-h-7 items-center border border-[var(--cr-stamp)] px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--cr-stamp)]"
                >
                  {milestone}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-2.5">
          {receipt.metrics.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 font-mono text-[12px]">
              <span className="text-[var(--text-muted)]">{row.label}</span>
              <span className={row.tone === "danger" ? "text-[var(--cr-danger)]" : ""}>{row.value}</span>
            </div>
          ))}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-2.5">
          {receipt.languages.length > 0 ? (
            receipt.languages.map((language) => (
              <div key={language.name} className="flex items-center justify-between gap-3 font-mono text-[11px]">
                <span className="min-w-0 flex-[0.9] truncate">{language.name}</span>
                <span className="flex flex-1 items-center justify-center">
                  <span className="h-[8px] w-[88px] overflow-hidden border border-[var(--text-faint)]">
                    <span
                      className="block h-full bg-[var(--text-muted)]"
                      style={{ width: `${language.fillPercentage}%` }}
                    />
                  </span>
                </span>
                <span className="w-12 text-right">{language.percentageLabel}</span>
              </div>
            ))
          ) : (
            <p className="font-mono text-[11px] text-[var(--text-muted)]">No language data available.</p>
          )}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-2.5">
          {receipt.activity.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 font-mono text-[12px]">
              <span className="text-[var(--text-muted)]">{row.label}</span>
              <span className="max-w-[62%] text-right">{row.value}</span>
            </div>
          ))}
        </section>

        <hr className="receipt-divider my-5" />

        <section>
          <div className="flex items-start justify-between gap-4 font-mono text-[12px]">
            <span className="text-[var(--text-muted)]">LICENSE</span>
            <span className="max-w-[62%] text-right">{data.license}</span>
          </div>
          {receipt.footerTopics.length > 0 ? (
            <p className="mt-4 font-mono text-[11px] leading-5 text-[var(--text-muted)]">
              {receipt.footerTopics.join(" ")}
            </p>
          ) : null}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-2.5">
          {receipt.notes.map((note) => (
            <p key={note} className="font-mono text-[11px] leading-5 text-[var(--text-muted)]">
              {note}
            </p>
          ))}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-1.5 font-mono text-[12px]">
          <p className="text-right">{receipt.subtotalLabel}</p>
          <p className="text-right text-[var(--cr-danger)]">{receipt.openIssuesLabel}</p>
        </section>

        <hr className="receipt-divider my-5" />

        <footer className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{receipt.serviceLine}</p>
          <p className="mt-4 font-display text-[22px] italic tracking-[0.02em]">THANK YOU FOR OPEN SOURCING</p>
          <p className="mt-3 font-mono text-[11px] leading-5 text-[var(--text-muted)]">{receipt.fortuneLine}</p>
          <div className="mt-5 flex justify-center">
            <div className="border border-[var(--cr-stamp)] p-2">
              <img src={qrDataUri} alt="" width={116} height={116} />
            </div>
          </div>
          <p className="mt-4 font-mono text-[11px] text-[var(--text-muted)]">{siteHost}</p>
        </footer>
      </div>
    </article>
  );
}
