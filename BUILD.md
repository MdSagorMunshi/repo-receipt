# Build and Hosting

## Recommendation

Bun is the recommended package manager for this project. The repository is maintained with Bun first.

## Requirements

- Node.js 20 or newer
- Bun 1.3 or newer recommended

## Environment Variables

Create `.env.local` from `.env.example` and set:

- `NEXT_PUBLIC_APP_NAME`: public-facing application name used in UI and metadata
- `NEXT_PUBLIC_SITE_URL`: canonical base URL used for embeds and metadata
- `GITHUB_TOKEN`: recommended for higher GitHub API rate limits
- `UPSTASH_REDIS_REST_URL`: optional Redis REST endpoint for image caching
- `UPSTASH_REDIS_REST_TOKEN`: optional Redis REST token
- `API_SIGNING_SECRET`: API signing token

## Install

Recommended:

```bash
bun install
```

Alternatives:

```bash
npm install
```

```bash
pnpm install
```

## Local Development

Recommended:

```bash
bun run dev
```

Alternatives:

```bash
npm run dev
```

```bash
pnpm dev
```

## Validation

Recommended:

```bash
bun run typecheck
bun run lint
bun run build
bun run test:satori
```

Alternatives:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:satori
```

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test:satori
```

## Production Build

Recommended:

```bash
bun run build
```

To serve the production build locally:

```bash
bun run start
```

## Hosting Notes

- The app is configured for Next.js standalone output in `next.config.ts`.
- The image generation route currently runs on Node.js because it uses `sharp`.
- If Upstash Redis is not configured, the app still works but generates receipt PNGs on demand.
- Set `NEXT_PUBLIC_SITE_URL` to the fully qualified deployed origin so README embeds and metadata resolve correctly.
- V2 adds `/compare`, format variants, milestone-based gallery collections, and deterministic paper personality across both DOM and PNG outputs.

## Vercel

1. Import the repository into Vercel.
2. Set the environment variables from `.env.example`.
3. Use the default Next.js build settings.
4. Deploy.

## Other Hosts

Any host that supports a standard Next.js Node runtime can run the app. For containerized or self-hosted deployment, build with `bun run build` and serve with `bun run start`.
