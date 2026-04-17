export default function CompareLoading() {
  return (
    <div className="loading-stage mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-16">
      <div className="receipt-loader-shell relative w-full max-w-[760px] overflow-hidden border border-[var(--text-faint)] bg-[var(--surface-bg)] px-6 py-7 paper-texture">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                SPLIT-BILL
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
                COMPARING TABLES
              </p>
            </div>
            <div className="loader-stamp px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em]">
              STAGING
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[0, 1].map((column) => (
              <div key={column} className="space-y-3">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-3 bg-[var(--text-faint)]/30"
                    style={{
                      width: `${index % 3 === 0 ? 88 : index % 3 === 1 ? 66 : 78}%`,
                      animation: `print-in 1.15s ${(column * 140) + index * 75}ms ease both`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <div className="loader-stamp px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em]">
              APPROVAL PENDING
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,transparent,rgba(184,146,42,0.16),transparent)] animate-[scan_1.8s_linear_infinite]" />
        <div className="receipt-loader-tear" />
      </div>
      <p className="mt-6 font-mono text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
        Settling the split-bill…
      </p>
      <p className="mt-3 max-w-2xl text-center font-body text-[15px] leading-7 text-[var(--text-muted)]">
        Comparing stars, balancing issue tabs, and lining up two kitchens on one check.
      </p>
      <style>{`
        @keyframes scan {
          from { transform: translateY(-24px); }
          to { transform: translateY(820px); }
        }
        @keyframes print-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-stage * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
