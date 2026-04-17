import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { getReceiptFormatDefinition } from "@/lib/receipt-formats";
import type { ReceiptFormat, ReceiptMode, RepoData } from "@/lib/types";

interface ReceiptDisplayShellProps {
  data: RepoData;
  mode?: ReceiptMode;
  format?: ReceiptFormat;
  className?: string;
}

export async function ReceiptDisplayShell({
  data,
  mode = "fine-print",
  format = "portrait",
  className = "",
}: ReceiptDisplayShellProps) {
  const formatDefinition = getReceiptFormatDefinition(format);

  return (
    <div className={`receipt-display-shell ${formatDefinition.shellClassName} ${className}`.trim()}>
      <div className={`receipt-display-stage ${formatDefinition.stageClassName}`}>
        <div className={`receipt-display-scale ${formatDefinition.scaleClassName}`}>
          <ReceiptCard data={data} mode={mode} />
        </div>
      </div>
    </div>
  );
}
