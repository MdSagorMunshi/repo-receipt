import React from "react";

import { buildCompareReceiptViewModel } from "@/lib/compare";
import type { QrMatrix } from "@/lib/qr";
import { buildCompareVariance } from "@/lib/render-variance";
import { getSiteHost } from "@/lib/site";
import { resolveTokens } from "@/lib/tokens";
import { truncateText } from "@/lib/transform";
import type { ReceiptMode, RepoData, ThemeMode } from "@/lib/types";

interface CompareReceiptSatoriProps {
  left: RepoData;
  right: RepoData;
  qrMatrix: QrMatrix;
  theme?: ThemeMode;
  mode?: ReceiptMode;
}

const monoFamily = "JetBrains Mono";
const displayFamily = "Playfair Display";

export function CompareReceiptSatori({
  left,
  right,
  qrMatrix,
  theme = "light",
  mode = "fine-print",
}: CompareReceiptSatoriProps) {
  const compare = buildCompareReceiptViewModel(left, right, mode);
  const variance = buildCompareVariance(left, right, mode);
  const tokens = resolveTokens(theme);
  const siteHost = getSiteHost();
  const frame = getModeFrame(mode, tokens);

  return (
    <div
      style={{
        width: 760,
        minHeight: 1220,
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
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: tokens.inkMuted }}>
          SPLIT-BILL
        </div>
        <div style={{ fontSize: 10, letterSpacing: 2.4, textTransform: "uppercase", color: tokens.inkFaint, marginTop: 8 }}>
          {compare.modeLabel}
        </div>
        <div style={{ fontSize: 11, color: tokens.inkMuted, marginTop: 12 }}>{compare.generatedAt}</div>
        <div style={{ fontSize: 11, color: tokens.inkFaint, marginTop: 8 }}>
          {compare.leftReceiptNumber} · {compare.rightReceiptNumber}
        </div>
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "row", marginTop: 18, marginBottom: 18 }}>
        {[left, right].map((repo, index) => (
          <div key={repo.fullName} style={{ width: "50%", paddingRight: index === 0 ? 12 : 0, paddingLeft: index === 1 ? 12 : 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: tokens.inkMuted }}>
              {index === 0 ? "Left Seat" : "Right Seat"}
            </div>
            <div
              style={{
                fontFamily: displayFamily,
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.02,
                marginTop: 12,
                marginBottom: 10,
              }}
            >
              {repo.fullName}
            </div>
            <div style={{ fontSize: 12, color: tokens.inkMuted, lineHeight: 1.55 }}>
              {truncateText(repo.description, 120)}
            </div>
          </div>
        ))}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", flexDirection: "row", fontSize: 10, color: tokens.inkMuted, marginBottom: 14 }}>
          <div style={{ width: 176 }}>Line Item</div>
          <div style={{ width: 150, textAlign: "right" }}>Left</div>
          <div style={{ width: 150, textAlign: "right" }}>Right</div>
          <div style={{ width: 190, textAlign: "right" }}>Lead</div>
        </div>
        {compare.rows.map((row, index) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              flexDirection: "row",
              fontSize: 12,
              marginBottom: index === compare.rows.length - 1 ? 0 : 10,
              color: row.tone === "danger" ? tokens.danger : tokens.ink,
            }}
          >
            <div style={{ width: 176, color: row.tone === "danger" ? tokens.danger : tokens.inkMuted }}>{row.label}</div>
            <div style={{ width: 150, textAlign: "right" }}>{row.left}</div>
            <div style={{ width: 150, textAlign: "right" }}>{row.right}</div>
            <div style={{ width: 190, textAlign: "right" }}>{row.lead}</div>
          </div>
        ))}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "row", marginTop: 18, marginBottom: 18 }}>
        {[
          { title: left.fullName, languages: compare.leftLanguages },
          { title: right.fullName, languages: compare.rightLanguages },
        ].map((column, index) => (
          <div key={column.title} style={{ width: "50%", paddingRight: index === 0 ? 12 : 0, paddingLeft: index === 1 ? 12 : 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: tokens.inkMuted }}>
              Language Mix
            </div>
            <div
              style={{
                fontFamily: displayFamily,
                fontSize: 22,
                fontStyle: "italic",
                marginTop: 10,
                marginBottom: 12,
              }}
            >
              {column.title}
            </div>
            {column.languages.map((language, languageIndex) => (
              <div
                key={`${column.title}-${language.name}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: languageIndex === column.languages.length - 1 ? 0 : 10,
                  fontSize: 11,
                }}
              >
                <div style={{ width: 80 }}>{language.name}</div>
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div
                    style={{
                      width: 110,
                      height: 8,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: tokens.inkFaint,
                      overflow: "hidden",
                      display: "flex",
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
                <div style={{ width: 46, textAlign: "right" }}>{language.percentageLabel}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        {compare.notes.map((note, index) => (
          <div
            key={`${note}-${index}`}
            style={{
              fontSize: 11,
              color: tokens.inkMuted,
              lineHeight: 1.55,
              marginBottom: index === compare.notes.length - 1 ? 0 : 8,
            }}
          >
            {note}
          </div>
        ))}
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 12, textAlign: "right", marginBottom: 6 }}>{compare.subtotalStarsLabel}</div>
        <div style={{ fontSize: 12, textAlign: "right" }}>{compare.subtotalCommitsLabel}</div>
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: tokens.inkMuted, marginBottom: 14 }}>
          {compare.serviceLine}
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
        <div style={{ fontSize: 11, color: tokens.inkMuted, marginBottom: 18, textAlign: "center" }}>
          {compare.fortuneLine}
        </div>
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
          key={`compare-fold-${index}`}
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
        <div key={`compare-qr-row-${rowIndex}`} style={{ display: "flex", flexDirection: "row", flex: 1 }}>
          {row.map((cell, cellIndex) => (
            <div
              key={`compare-qr-cell-${rowIndex}-${cellIndex}`}
              style={{ flex: 1, backgroundColor: cell ? darkColor : lightColor }}
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
      ------------------------------------------------------------------------
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
      borderColor: tokens.inkFaint,
    };
  }

  if (mode === "ledger-noir") {
    return {
      backgroundColor: "#efe4d0",
      borderColor: tokens.stamp,
    };
  }

  return {
    backgroundColor: tokens.paper,
    borderColor: tokens.inkFaint,
  };
}
