export default function ReceiptLoading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-[480px] overflow-hidden border border-[var(--text-faint)] bg-[var(--surface-bg)] px-6 py-7 paper-texture">
        <div className="relative z-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            REPO-RECEIPT
          </p>
          <div className="mt-5 space-y-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="h-3 bg-[var(--text-faint)]/30"
                style={{
                  width: `${index % 3 === 0 ? 88 : index % 3 === 1 ? 66 : 78}%`,
                  animation: `print-in 1.2s ${index * 90}ms ease both`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,transparent,rgba(184,146,42,0.16),transparent)] animate-[scan_1.8s_linear_infinite]" />
      </div>
      <p className="mt-6 font-mono text-sm text-[var(--text-muted)]">Printing your receipt…</p>
      <style>{`
        @keyframes scan {
          from { transform: translateY(-24px); }
          to { transform: translateY(520px); }
        }
        @keyframes print-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
