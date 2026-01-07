# URL Shortener - go.a04.dev

Security-first URL shortener at `https://go.a04.dev`.

## Tech Stack

- **Next.js 15** (App Router, Node.js runtime)
- **Neon Postgres** (via Vercel Marketplace)
- **Drizzle ORM** + `@neondatabase/serverless`
- **Browser Extension** (Manifest V3)

## Structure

```
url-shortener/
├── apps/shortener/     # Next.js app
│   ├── app/
│   │   ├── [code]/route.ts       # GET /:code → redirect
│   │   ├── api/v1/shorten/route.ts
│   │   └── healthz/route.ts
│   ├── lib/            # DB, auth, validation
│   └── scripts/        # Token management
├── extension/          # Browser extension
├── deploy/             # Deployment docs
└── docs/               # Architecture docs
```

## API

| Endpoint          | Method | Auth         | Description               |
| ----------------- | ------ | ------------ | ------------------------- |
| `/:code`          | GET    | None         | 302 redirect (or 404/410) |
| `/api/v1/shorten` | POST   | Bearer token | Create short link         |
| `/healthz`        | GET    | None         | Health check              |

## Quick Start

```bash
cd apps/shortener
npm install
npx vercel env pull .env.local
npm run dev
```

## Docs

- [Architecture & Decisions](./docs/PART1_DOCS_SUMMARY.md)
- [Security](./SECURITY.md)
- [Threat Model](./THREAT_MODEL.md)
- [Deployment](./deploy/vercel-setup.md)
