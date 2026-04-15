import { mkdtemp, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { renderReceiptPng } from "@/lib/receipt-image";
import { sampleRepoData } from "@/lib/sample-data";

async function main() {
  const dir = await mkdtemp(path.join(tmpdir(), "repo-receipt-"));
  const output = path.join(dir, "smoke.png");
  const png = await renderReceiptPng(sampleRepoData);
  await writeFile(output, png);

  const info = await stat(output);

  if (info.size <= 0) {
    throw new Error("Expected non-empty PNG output.");
  }

  console.log(output);
  console.log(info.size);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
