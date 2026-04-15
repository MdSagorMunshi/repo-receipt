![repo-receipt hero](./public/hero-facebook-react.png)

# repo-receipt

Every repo has a receipt.

repo-receipt is a Next.js application that transforms any public GitHub repository into a shareable, print-style receipt image. A repository URL becomes a structured receipt containing stars, forks, watchers, languages, contributors, commit history, repository age, and other metadata, rendered both as interactive HTML and as a downloadable PNG.

[![Give a star on GitHub](https://img.shields.io/badge/Give%20a%20star%20on-GitHub-1A1814?style=for-the-badge&logo=github)](https://github.com/MdSagorMunshi/repo-receipt)

## Product Summary

- Paste any public GitHub repository URL and generate a receipt view instantly.
- Render a matching high-resolution PNG for download, Open Graph previews, and README embeds.
- Cache generated receipt images for 24 hours when Upstash Redis is configured.
- Support light and dark presentation with a fixed Fine Print visual system.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4 for layout and spacing
- Satori and sharp for image generation
- GitHub GraphQL and REST APIs for repository data
- Upstash Redis for optional image caching

## Environment

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `GITHUB_TOKEN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Development

Bun is the recommended package manager for this repository.

```bash
bun install
bun run dev
```

## Verification

```bash
bun run typecheck
bun run lint
bun run build
bun run test:satori
```

## Documentation

- [BUILD.md](./BUILD.md): installation, build, hosting, and deployment notes
- [CONTRIBUTING.md](./CONTRIBUTING.md): contributor workflow and renderer constraints

## Support

- Email: [ryn@disr.it](mailto:ryn@disr.it)

## License

[MIT](./LICENSE)
