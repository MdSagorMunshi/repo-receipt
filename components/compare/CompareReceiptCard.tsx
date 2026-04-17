/* eslint-disable @next/next/no-img-element */

import { buildCompareReceiptViewModel } from "@/lib/compare";
import { buildCompareVariance } from "@/lib/render-variance";
import { getReceiptModeDefinition } from "@/lib/receipt-modes";
import { createQrDataUri } from "@/lib/qr";
import { getSiteHost } from "@/lib/site";
import type { ReceiptMode, RepoData } from "@/lib/types";

interface CompareReceiptCardProps {
  left: RepoData;
  right: RepoData;
  compareUrl: string;
  mode?: ReceiptMode;
  className?: string;
}

export async function CompareReceiptCard({
  left,
  right,
  compareUrl,
  mode = "fine-print",
  className = "",
}: CompareReceiptCardProps) {
  const compare = buildCompareReceiptViewModel(left, right, mode);
  const variance = buildCompareVariance(left, right, mode);
  const modeDefinition = getReceiptModeDefinition(mode);
  const qrDataUri = await createQrDataUri(compareUrl);
  const siteHost = getSiteHost();

  return (
    <article className={`compare-card paper-texture ${modeDefinition.cardClassName} px-6 py-7 ${className}`}>
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
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">SPLIT-BILL</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-faint)]">
            {compare.modeLabel}
          </p>
          <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">{compare.generatedAt}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
            {compare.leftReceiptNumber} · {compare.rightReceiptNumber}
          </p>
        </header>

        <hr className="receipt-divider my-5" />

        <section className="grid gap-5 md:grid-cols-2">
          {[left, right].map((repo, index) => (
            <div key={repo.fullName}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {index === 0 ? "Left Seat" : "Right Seat"}
              </p>
              <h2 className="mt-3 font-display text-[30px] leading-[1.02] tracking-[-0.03em]">{repo.fullName}</h2>
              <p className="mt-3 font-mono text-[12px] leading-5 text-[var(--text-muted)]">{repo.description}</p>
            </div>
          ))}
        </section>

        <hr className="receipt-divider my-5" />

        <section>
          <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_120px] gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            <span>Line Item</span>
            <span className="text-right">Left</span>
            <span className="text-right">Right</span>
            <span className="text-right">Lead</span>
          </div>
          <div className="mt-4 space-y-3">
            {compare.rows.map((row) => (
              <div
                key={row.label}
                className={`grid grid-cols-[minmax(0,1fr)_110px_110px_120px] gap-3 font-mono text-[12px] ${
                  row.tone === "danger" ? "text-[var(--cr-danger)]" : ""
                }`}
              >
                <span className={row.tone === "danger" ? "text-[var(--cr-danger)]" : "text-[var(--text-muted)]"}>
                  {row.label}
                </span>
                <span className="text-right">{row.left}</span>
                <span className="text-right">{row.right}</span>
                <span className="text-right">{row.lead}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="receipt-divider my-5" />

        <section className="grid gap-5 md:grid-cols-2">
          {[
            { title: left.fullName, languages: compare.leftLanguages },
            { title: right.fullName, languages: compare.rightLanguages },
          ].map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Language Mix
              </p>
              <p className="mt-3 font-display text-[22px] italic">{column.title}</p>
              <div className="mt-4 space-y-2.5">
                {column.languages.map((language) => (
                  <div key={`${column.title}-${language.name}`} className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="w-20 truncate">{language.name}</span>
                    <span className="flex-1">
                      <span className="block h-[8px] overflow-hidden border border-[var(--text-faint)]">
                        <span
                          className="block h-full bg-[var(--text-muted)]"
                          style={{ width: `${language.fillPercentage}%` }}
                        />
                      </span>
                    </span>
                    <span className="w-11 text-right">{language.percentageLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-2.5">
          {compare.notes.map((note) => (
            <p key={note} className="font-mono text-[11px] leading-5 text-[var(--text-muted)]">
              {note}
            </p>
          ))}
        </section>

        <hr className="receipt-divider my-5" />

        <section className="space-y-1.5 font-mono text-[12px]">
          <p className="text-right">{compare.subtotalStarsLabel}</p>
          <p className="text-right">{compare.subtotalCommitsLabel}</p>
        </section>

        <hr className="receipt-divider my-5" />

        <footer className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {compare.serviceLine}
          </p>
          <p className="mt-4 font-display text-[22px] italic tracking-[0.02em]">THANK YOU FOR OPEN SOURCING</p>
          <p className="mt-3 font-mono text-[11px] leading-5 text-[var(--text-muted)]">{compare.fortuneLine}</p>
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
