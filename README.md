<div align="center">

# repo-receipt

**Every repo has a receipt.**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=green)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-1A1814?style=for-the-badge)](./LICENSE)

[![Give a star on GitHub](https://img.shields.io/badge/Give%20a%20star%20on-GitHub-1A1814?style=for-the-badge&logo=github)](https://github.com/MdSagorMunshi/repo-receipt)

</div>

---

repo-receipt transforms any public GitHub repository into a shareable, print-style receipt. Paste a repository URL and receive a structured record of its stars, forks, languages, contributors, commit history, and age — rendered as interactive HTML and a downloadable high-resolution PNG.

<div align="center">
  <img src="./public/hero-facebook-react.png" alt="repo-receipt hero" width="380" />
</div>

---

## Features

- **Instant receipt generation** — paste any public GitHub repository URL and generate a receipt view immediately
- **High-resolution PNG export** — download a print-ready image suitable for social previews, Open Graph cards, and README embeds
- **24-hour image caching** — generated receipts are cached via Upstash Redis to minimise API usage and maximise performance
- **Light and dark presentation** — both modes are supported within the Fine Print visual system
- **Open embeds** — public receipt images stay openly accessible; interactive downloads are signed

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Image Generation | Satori + sharp |
| Data | GitHub GraphQL API + REST API |
| Caching | Upstash Redis (optional) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended package manager)
- A GitHub personal access token with `public_repo` read scope
- An Upstash Redis database (optional, for image caching)

### Installation

```bash
git clone https://github.com/MdSagorMunshi/repo-receipt.git
cd repo-receipt
bun install
```

### Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | Yes | Application display name |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL of your deployment |
| `GITHUB_TOKEN` | Yes | GitHub personal access token |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis endpoint for image caching |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis authentication token |
| `API_SIGNING_SECRET` | Yes | API signing token |

### Development

```bash
bun run dev
```

---

## Verification

Run the full verification suite before committing:

```bash
bun run typecheck   # TypeScript type checking
bun run lint        # ESLint
bun run build       # Production build
bun run test:satori # Satori renderer tests
```

---

## Documentation

| Document | Contents |
|---|---|
| [BUILD.md](./BUILD.md) | Installation, build pipeline, hosting, and deployment notes |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contributor workflow, renderer constraints, and PR guidelines |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. All renderer changes must pass `bun run test:satori` and produce pixel-consistent PNG output.

---

## Support

For questions or issues, reach out at [ryn@disr.it](mailto:ryn@disr.it) or open an issue on GitHub.

---

## Developer

Built by **Ryan Shelby**

- GitHub: [github.com/MdSagorMunshi](https://github.com/MdSagorMunshi)
- GitLab: [gitlab.com/rynex](https://gitlab.com/rynex)
- Email: [ryn@disr.it](mailto:ryn@disr.it)

---

## License

[MIT](./LICENSE) — Public embeds stay open. Interactive downloads are signed.
