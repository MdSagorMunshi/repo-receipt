import { readFile } from "node:fs/promises";
import path from "node:path";

import satori from "satori";
import sharp from "sharp";

import { ReceiptSatori } from "@/components/receipt/ReceiptSatori";
import { createQrDataUri } from "@/lib/qr";
import type { RepoData } from "@/lib/types";

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

export async function renderReceiptPng(data: RepoData) {
  const [fonts, qrDataUri] = await Promise.all([loadReceiptFonts(), createQrDataUri(data.repoUrl)]);

  const svg = await satori(<ReceiptSatori data={data} qrDataUri={qrDataUri} />, {
    width: 480,
    height: 1152,
    fonts: [
      {
        name: "JetBrains Mono",
        data: fonts.jetbrains,
        weight: 400,
        style: "normal",
      },
      {
        name: "JetBrains Mono",
        data: fonts.jetbrainsMedium,
        weight: 500,
        style: "normal",
      },
      {
        name: "Playfair Display",
        data: fonts.playfairBold,
        weight: 700,
        style: "normal",
      },
      {
        name: "Playfair Display",
        data: fonts.playfairItalic,
        weight: 700,
        style: "italic",
      },
    ],
  });

  return sharp(Buffer.from(svg))
    .resize({ width: 960 })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}
