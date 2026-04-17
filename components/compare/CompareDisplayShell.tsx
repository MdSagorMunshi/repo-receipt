import { CompareReceiptCard } from "@/components/compare/CompareReceiptCard";
import type { ReceiptFormat, ReceiptMode, RepoData } from "@/lib/types";

interface CompareDisplayShellProps {
  left: RepoData;
  right: RepoData;
  compareUrl: string;
  mode?: ReceiptMode;
  format?: ReceiptFormat;
}

export async function CompareDisplayShell({
  left,
  right,
  compareUrl,
  mode = "fine-print",
  format = "portrait",
}: CompareDisplayShellProps) {
  const stageClassName =
    format === "square"
      ? "compare-stage-square"
      : format === "story"
        ? "compare-stage-story"
        : format === "readme-strip"
          ? "compare-stage-readme-strip"
          : "compare-stage-portrait";
  const scaleClassName =
    format === "square"
      ? "compare-scale-square"
      : format === "story"
        ? "compare-scale-story"
        : format === "readme-strip"
          ? "compare-scale-readme-strip"
          : "compare-scale-portrait";

  return (
    <div className="compare-display-shell">
      <div className={`compare-display-stage ${stageClassName}`}>
        <div className={`compare-display-scale ${scaleClassName}`}>
          <CompareReceiptCard left={left} right={right} compareUrl={compareUrl} mode={mode} />
        </div>
      </div>
    </div>
  );
}
