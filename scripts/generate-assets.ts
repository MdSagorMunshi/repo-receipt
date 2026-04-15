import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { renderReceiptPng } from "@/lib/receipt-image";
import { sampleRepoData } from "@/lib/sample-data";
import { getAppName } from "@/lib/site";

const publicDir = path.join(process.cwd(), "public");
const appName = getAppName();

function ogSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#F2EDE0"/>
      <rect x="384" y="78" width="410" height="480" fill="#FDFAF4" transform="rotate(-5 384 78)"/>
      <rect x="394" y="88" width="390" height="460" fill="#FDFAF4" stroke="#B5AB9C" stroke-width="2" transform="rotate(-5 394 88)"/>
      <g transform="rotate(-5 394 88)">
        <text x="587" y="168" text-anchor="middle" font-family="'JetBrains Mono'" font-size="28" letter-spacing="7" fill="#1A1814">${appName}</text>
        <line x1="456" y1="206" x2="718" y2="206" stroke="#B5AB9C" stroke-width="2" stroke-dasharray="8 8"/>
        <line x1="456" y1="252" x2="718" y2="252" stroke="#6B6457" stroke-width="2"/>
        <line x1="456" y1="286" x2="690" y2="286" stroke="#6B6457" stroke-width="2"/>
        <line x1="456" y1="340" x2="718" y2="340" stroke="#B5AB9C" stroke-width="2" stroke-dasharray="8 8"/>
        <line x1="456" y1="390" x2="702" y2="390" stroke="#6B6457" stroke-width="2"/>
        <line x1="456" y1="420" x2="675" y2="420" stroke="#6B6457" stroke-width="2"/>
      </g>
    </svg>
  `;
}

function gallerySvg() {
  const slips = Array.from({ length: 9 }).map((_, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 80 + col * 420 + (row % 2 === 0 ? 0 : 36);
    const y = 30 + row * 84;
    const rotate = [-7, -3, 4, 6, -5, 2, -4, 5, -2][index];

    return `
      <g transform="translate(${x} ${y}) rotate(${rotate})">
        <rect width="260" height="180" fill="#FDFAF4" stroke="#B5AB9C" stroke-width="2"/>
        <line x1="24" y1="34" x2="236" y2="34" stroke="#1A1814" stroke-width="2"/>
        <line x1="24" y1="56" x2="224" y2="56" stroke="#6B6457" stroke-width="2"/>
        <line x1="24" y1="92" x2="236" y2="92" stroke="#B5AB9C" stroke-width="2" stroke-dasharray="8 8"/>
        <line x1="24" y1="122" x2="190" y2="122" stroke="#6B6457" stroke-width="2"/>
      </g>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1440" height="320" viewBox="0 0 1440 320">
      <rect width="1440" height="320" fill="#F2EDE0"/>
      ${slips.join("")}
    </svg>
  `;
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  await Promise.all([
    sharp(Buffer.from(ogSvg())).png().toFile(path.join(publicDir, "og-default.png")),
    sharp(Buffer.from(gallerySvg())).png().toFile(path.join(publicDir, "gallery-header.png")),
  ]);

  const heroPng = await renderReceiptPng(sampleRepoData);
  await writeFile(path.join(publicDir, "hero-facebook-react.png"), heroPng);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
