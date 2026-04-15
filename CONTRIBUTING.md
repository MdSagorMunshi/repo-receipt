# Contributing

## Local development

1. Install dependencies with `pnpm install`.
2. Start the app with `pnpm dev`.
3. Add `GITHUB_TOKEN` to `.env.local` if you want higher GitHub API limits.
4. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test:satori` before opening a pull request.

## Architecture

- `app/` contains the App Router pages and the PNG route handler.
- `components/receipt/` contains both receipt renderers: the DOM card and the Satori tree.
- `lib/github.ts` is the GitHub data layer.
- `lib/receipt-image.ts` is the image pipeline shared by the API route and smoke test.
- `styles/globals.css` contains the Fine Print design tokens and global UI rules.

## Receipt design constraints

- The Satori receipt is the source of truth. If the DOM receipt diverges, update the DOM version to match.
- Keep the receipt width at `480px` and the rendered PNG at `960px`.
- Do not introduce unsupported CSS into the Satori tree. Prefer flex layouts, explicit spacing, and resolved color literals.
- Keep all colors tokenized in `styles/globals.css` and `lib/tokens.ts`.
- Avoid UI libraries and icon packs. The visual language depends on hand-built primitives.
