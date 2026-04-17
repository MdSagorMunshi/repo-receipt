import { readFile } from "node:fs/promises";
import path from "node:path";

import React from "react";
import satori from "satori";
import sharp from "sharp";

import { CompareReceiptSatori } from "@/components/compare/CompareReceiptSatori";
import { createQrMatrix } from "@/lib/qr";
import type { ReceiptFormat, ReceiptMode, RepoData } from "@/lib/types";

let fontCache:
  | {
      jetbrains: ArrayBuffer;
      jetbrainsMedium: ArrayBuffer;
      playfairBold: ArrayBuffer;
      playfairItalic: ArrayBuffer;
    }
  | undefined;

async function loadReceiptFonts() {
  if (fontCache) {
    return fontCache;
  }

  const base = path.join(process.cwd(), "public", "fonts");
  const [jetbrains, jetbrainsMedium, playfairBold, playfairItalic] = await Promise.all([
    readFile(path.join(base, "jetbrains-mono-400.woff")),
    readFile(path.join(base, "jetbrains-mono-500.woff")),
    readFile(path.join(base, "playfair-display-700.woff")),
    readFile(path.join(base, "playfair-display-700-italic.woff")),
  ]);

  fontCache = {
    jetbrains: jetbrains.buffer.slice(jetbrains.byteOffset, jetbrains.byteOffset + jetbrains.byteLength),
    jetbrainsMedium: jetbrainsMedium.buffer.slice(
      jetbrainsMedium.byteOffset,
      jetbrainsMedium.byteOffset + jetbrainsMedium.byteLength,
    ),
    playfairBold: playfairBold.buffer.slice(
      playfairBold.byteOffset,
      playfairBold.byteOffset + playfairBold.byteLength,
    ),
    playfairItalic: playfairItalic.buffer.slice(
      playfairItalic.byteOffset,
      playfairItalic.byteOffset + playfairItalic.byteLength,
    ),
  };

  return fontCache;
}

export async function renderComparePng(
  left: RepoData,
  right: RepoData,
  compareUrl: string,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
) {
  const [fonts, qrMatrix] = await Promise.all([
    loadReceiptFonts(),
    Promise.resolve(createQrMatrix(compareUrl)),
  ]);

  const svg = await satori(
    <CompareReceiptSatori left={left} right={right} qrMatrix={qrMatrix} mode={mode} />,
    {
      width: 760,
      height: 1220,
      fonts: [
        { name: "JetBrains Mono", data: fonts.jetbrains, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: fonts.jetbrainsMedium, weight: 500, style: "normal" },
        { name: "Playfair Display", data: fonts.playfairBold, weight: 700, style: "normal" },
        { name: "Playfair Display", data: fonts.playfairItalic, weight: 700, style: "italic" },
      ],
    },
  );

  const portraitPng = await sharp(Buffer.from(svg))
    .resize({ width: 1520 })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  if (format === "portrait") {
    return portraitPng;
  }

  return renderFormattedVariant(portraitPng, format);
}

async function renderFormattedVariant(portraitPng: Buffer, format: ReceiptFormat) {
  if (format === "square") {
    return buildCompositeCanvas(portraitPng, {
      width: 1080,
      height: 1080,
      receiptWidth: 720,
      receiptLeft: 180,
      receiptTop: 44,
      background: "#f2ede0",
      accent: "#e0d5bd",
      accentWidth: 6,
    });
  }

  if (format === "story") {
    return buildCompositeCanvas(portraitPng, {
      width: 1080,
      height: 1920,
      receiptWidth: 820,
      receiptLeft: 130,
      receiptTop: 92,
      background: "#eee5d4",
      accent: "#d7c8a7",
      accentWidth: 8,
    });
  }

  return buildCompositeCanvas(portraitPng, {
    width: 1600,
    height: 900,
    receiptWidth: 760,
    receiptLeft: 72,
    receiptTop: 92,
    background: "#f3eee4",
    accent: "#cbbd9d",
    accentWidth: 10,
  });
}

async function buildCompositeCanvas(
  portraitPng: Buffer,
  {
    width,
    height,
    receiptWidth,
    receiptLeft,
    receiptTop,
    background,
    accent,
    accentWidth,
  }: {
    width: number;
    height: number;
    receiptWidth: number;
    receiptLeft: number;
    receiptTop: number;
    background: string;
    accent: string;
    accentWidth: number;
  },
) {
  const receipt = await sharp(portraitPng).resize({ width: receiptWidth }).toBuffer();

  const accentSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${background}" />
      <rect x="0" y="0" width="${accentWidth}" height="${height}" fill="${accent}" />
      <rect x="${width - accentWidth}" y="0" width="${accentWidth}" height="${height}" fill="${accent}" opacity="0.55" />
    </svg>
  `);

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  })
    .composite([
      { input: accentSvg, top: 0, left: 0 },
      { input: receipt, top: receiptTop, left: receiptLeft },
    ])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}
