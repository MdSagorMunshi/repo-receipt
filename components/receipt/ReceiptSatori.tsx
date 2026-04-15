/* eslint-disable @next/next/no-img-element */

import { buildReceiptViewModel } from "@/lib/receipt";
import { getSiteHost } from "@/lib/site";
import { resolveTokens } from "@/lib/tokens";
import { truncateText } from "@/lib/transform";
import type { RepoData, ThemeMode } from "@/lib/types";

interface ReceiptSatoriProps {
  data: RepoData;
  qrDataUri: string;
  theme?: ThemeMode;
}

const monoFamily = "JetBrains Mono";
const displayFamily = "Playfair Display";

export function ReceiptSatori({ data, qrDataUri, theme = "light" }: ReceiptSatoriProps) {
  const receipt = buildReceiptViewModel(data);
  const tokens = resolveTokens(theme);
  const siteHost = getSiteHost();

  return (
    <div
      style={{
        width: 480,
        minHeight: 1152,
        display: "flex",
        flexDirection: "column",
        backgroundColor: tokens.paper,
        color: tokens.ink,
        paddingTop: 28,
        paddingRight: 24,
        paddingBottom: 28,
        paddingLeft: 24,
        fontFamily: monoFamily,
        borderWidth: 1,
        borderColor: tokens.inkFaint,
        borderStyle: "solid",
      }}
    >
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
        <div style={{ fontSize: 12, textAlign: "right", marginBottom: 6 }}>{receipt.subtotalLabel}</div>
        <div style={{ fontSize: 12, textAlign: "right", color: tokens.danger }}>{receipt.openIssuesLabel}</div>
      </div>

      <DashDivider color={tokens.inkFaint} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 18 }}>
        <div
          style={{
            fontFamily: displayFamily,
            fontSize: 23,
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          THANK YOU FOR OPEN SOURCING
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
          <img src={qrDataUri} width="116" height="116" alt="" />
        </div>
        <div style={{ fontSize: 11, color: tokens.inkMuted }}>{siteHost}</div>
      </div>
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
