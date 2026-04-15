import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const hookPath = path.join(process.cwd(), ".git", "hooks", "pre-commit");
const hookBody = `#!/bin/sh
pnpm typecheck
`;

await mkdir(path.dirname(hookPath), { recursive: true });
await writeFile(hookPath, hookBody, { mode: 0o755 });
