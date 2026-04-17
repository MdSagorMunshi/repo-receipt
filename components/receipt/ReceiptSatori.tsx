import React from "react";

import type { QrMatrix } from "@/lib/qr";
import { buildReceiptViewModel } from "@/lib/receipt";
import { buildReceiptVariance } from "@/lib/render-variance";
import { getSiteHost } from "@/lib/site";
import { resolveTokens } from "@/lib/tokens";
import { truncateText } from "@/lib/transform";
import type { ReceiptMode, RepoData, ThemeMode } from "@/lib/types";

interface ReceiptSatoriProps {
  data: RepoData;
  qrMatrix: QrMatrix;
  theme?: ThemeMode;
  mode?: ReceiptMode;
}

const monoFamily = "JetBrains Mono";
const displayFamily = "Playfair Display";

export function ReceiptSatori({ data, qrMatrix, theme = "light", mode = "fine-print" }: ReceiptSatoriProps) {
  const receipt = buildReceiptViewModel(data, mode);
  const variance = buildReceiptVariance(data, mode);
  const tokens = resolveTokens(theme);
  const siteHost = getSiteHost();
  const frame = getModeFrame(mode, tokens);

  return (
    <div
      style={{
        width: 480,
        minHeight: 1152,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundColor: frame.backgroundColor,
        color: tokens.ink,
        paddingTop: 28,
        paddingRight: 24,
        paddingBottom: 28,
        paddingLeft: 24,
        fontFamily: monoFamily,
        borderWidth: 1,
        borderColor: frame.borderColor,
        borderStyle: "solid",
      }}
    >
      <PaperVarianceLayer
        docketLabel={variance.docketLabel}
        stampLabel={variance.stampLabel}
        stampTone={variance.stampTone}
        stampTop={variance.stampTop}
        stampLeft={variance.stampLeft}
        stampWidth={variance.stampWidth}
        foldLines={variance.foldLines}
        paperColor={frame.backgroundColor}
        stampColor={tokens.stamp}
        mutedColor={tokens.inkFaint}
        dangerColor={tokens.danger}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: tokens.inkMuted,
          }}
        >
          REPO-RECEIPT
        </div>
        <div style={{ fontSize: 10, letterSpacing: 2.4, textTransform: "uppercase", color: tokens.inkFaint, marginTop: 8 }}>
          {receipt.modeLabel}
        </div>
        <div style={{ fontSize: 12, marginTop: 12 }}>{receipt.receiptNumber}</div>
        <div style={{ fontSize: 11, color: tokens.inkMuted, marginTop: 4 }}>{receipt.generatedAt}</div>
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        <div
          style={{
            fontFamily: displayFamily,
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.02,
            marginBottom: 10,
          }}
        >
          {data.fullName}
        </div>
        <div style={{ fontSize: 12, color: tokens.inkMuted, lineHeight: 1.55 }}>
          {truncateText(receipt.description, 108)}
        </div>
        {receipt.milestones.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: 14 }}>
            {receipt.milestones.map((milestone, index) => (
              <div
                key={`${milestone}-${index}`}
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: tokens.stamp,
                  color: tokens.stamp,
                  fontSize: 10,
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  paddingTop: 6,
                  paddingRight: 8,
                  paddingBottom: 6,
                  paddingLeft: 8,
                  marginRight: 8,
                  marginTop: index > 1 ? 8 : 0,
                }}
              >
                {milestone}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <ReceiptSectionRows rows={receipt.metrics} mutedColor={tokens.inkMuted} dangerColor={tokens.danger} />

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        {receipt.languages.length > 0 ? (
          receipt.languages.map((language, index) => (
            <div
              key={`${language.name}-${index}`}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: index === receipt.languages.length - 1 ? 0 : 10,
                fontSize: 11,
              }}
            >
              <div style={{ width: 92 }}>{language.name}</div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 8,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: tokens.inkFaint,
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      width: `${language.fillPercentage}%`,
                      height: "100%",
                      backgroundColor: tokens.inkMuted,
                    }}
                  />
                </div>
              </div>
              <div style={{ width: 48, textAlign: "right" }}>{language.percentageLabel}</div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 11, color: tokens.inkMuted }}>No language data available.</div>
        )}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <ReceiptSectionRows rows={receipt.activity} mutedColor={tokens.inkMuted} dangerColor={tokens.danger} />

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            fontSize: 12,
            marginBottom: receipt.footerTopics.length > 0 ? 14 : 0,
          }}
        >
          <div style={{ color: tokens.inkMuted }}>LICENSE</div>
          <div>{data.license}</div>
        </div>
        {receipt.footerTopics.length > 0 ? (
          <div style={{ fontSize: 11, color: tokens.inkMuted, lineHeight: 1.55 }}>
            {receipt.footerTopics.join(" ")}
          </div>
        ) : null}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        {receipt.notes.map((note, index) => (
          <div
            key={`${note}-${index}`}
            style={{
              fontSize: 11,
              color: tokens.inkMuted,
              lineHeight: 1.55,
              marginBottom: index === receipt.notes.length - 1 ? 0 : 8,
            }}
          >
            {note}
          </div>
        ))}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 12, textAlign: "right", marginBottom: 6 }}>{receipt.subtotalLabel}</div>
        <div style={{ fontSize: 12, textAlign: "right", color: tokens.danger }}>{receipt.openIssuesLabel}</div>
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: tokens.inkMuted, marginBottom: 14 }}>
          {receipt.serviceLine}
        </div>
        <div
          style={{
            fontFamily: displayFamily,
            fontSize: 23,
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          THANK YOU FOR OPEN SOURCING
        </div>
        <div style={{ fontSize: 11, color: tokens.inkMuted, marginBottom: 18, textAlign: "center" }}>{receipt.fortuneLine}</div>
        <div
          style={{
            width: 132,
            height: 132,
            paddingTop: 8,
            paddingRight: 8,
            paddingBottom: 8,
            paddingLeft: 8,
            borderWidth: 1,
            borderColor: tokens.stamp,
            borderStyle: "solid",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <SatoriQrCode matrix={qrMatrix} darkColor={tokens.ink} lightColor={tokens.paper} />
        </div>
        <div style={{ fontSize: 11, color: tokens.inkMuted }}>{siteHost}</div>
      </div>
    </div>
  );
}

function PaperVarianceLayer({
  docketLabel,
  stampLabel,
  stampTone,
  stampTop,
  stampLeft,
  stampWidth,
  foldLines,
  paperColor,
  stampColor,
  mutedColor,
  dangerColor,
}: {
  docketLabel: string;
  stampLabel: string;
  stampTone: "stamp" | "muted" | "danger";
  stampTop: number;
  stampLeft: number;
  stampWidth: number;
  foldLines: number[];
  paperColor: string;
  stampColor: string;
  mutedColor: string;
  dangerColor: string;
}) {
  const resolvedStampColor = stampTone === "danger" ? dangerColor : stampTone === "muted" ? mutedColor : stampColor;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: mutedColor,
          color: mutedColor,
          fontSize: 10,
          letterSpacing: 1.3,
          paddingTop: 5,
          paddingRight: 7,
          paddingBottom: 5,
          paddingLeft: 7,
          textTransform: "uppercase",
        }}
      >
        {docketLabel}
      </div>
      {foldLines.map((foldLine, index) => (
        <div
          key={`fold-${index}`}
          style={{
            position: "absolute",
            top: foldLine,
            left: 18,
            right: 18,
            height: 2,
            backgroundColor: mutedColor,
            opacity: 0.16,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: stampTop,
          left: stampLeft,
          width: stampWidth,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: resolvedStampColor,
          color: resolvedStampColor,
          fontSize: 11,
          letterSpacing: 1.8,
          textAlign: "center",
          textTransform: "uppercase",
          paddingTop: 8,
          paddingRight: 10,
          paddingBottom: 8,
          paddingLeft: 10,
          backgroundColor: paperColor,
          opacity: 0.5,
        }}
      >
        {stampLabel}
      </div>
    </>
  );
}

function SatoriQrCode({
  matrix,
  darkColor,
  lightColor,
}: {
  matrix: QrMatrix;
  darkColor: string;
  lightColor: string;
}) {
  return (
    <div
      style={{
        width: 116,
        height: 116,
        display: "flex",
        flexDirection: "column",
        backgroundColor: lightColor,
      }}
    >
      {matrix.cells.map((row, rowIndex) => (
        <div
          key={`qr-row-${rowIndex}`}
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
          {row.map((cell, cellIndex) => (
            <div
              key={`qr-cell-${rowIndex}-${cellIndex}`}
              style={{
                flex: 1,
                backgroundColor: cell ? darkColor : lightColor,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DashDivider({ color }: { color: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        color,
        lineHeight: 1,
        marginTop: 0,
        marginBottom: 0,
      }}
    >
      ----------------------------------------
    </div>
  );
}

function ReceiptSectionRows({
  rows,
  mutedColor,
  dangerColor,
}: {
  rows: Array<{ label: string; value: string; tone?: "default" | "danger" }>;
  mutedColor: string;
  dangerColor: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
      {rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontSize: 12,
            marginBottom: index === rows.length - 1 ? 0 : 10,
          }}
        >
          <div style={{ color: mutedColor }}>{row.label}</div>
          <div style={{ color: row.tone === "danger" ? dangerColor : undefined, textAlign: "right", maxWidth: 220 }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function getModeFrame(
  mode: ReceiptMode,
  tokens: ReturnType<typeof resolveTokens>,
): { backgroundColor: string; borderColor: string } {
  if (mode === "thermal") {
    return {
      backgroundColor: "#fbf3df",
      borderColor: tokens.stamp,
    };
  }

  if (mode === "archive") {
    return {
      backgroundColor: "#f2f3e7",
      borderColor: "#9aa08b",
    };
  }

  if (mode === "ledger-noir") {
    return {
      backgroundColor: "#f8efe1",
      borderColor: "#8d7436",
    };
  }

  return {
    backgroundColor: tokens.paper,
    borderColor: tokens.inkFaint,
  };
}
