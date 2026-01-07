# URL Shortener - go.a04.dev

Security-first URL shortener at `https://go.a04.dev`.

## Tech Stack

- **Next.js 16** (App Router, Node.js runtime)
- **Neon Postgres** (via Vercel Marketplace)
- **@neondatabase/serverless** (HTTP driver)
- **Browser Extension** (Manifest V3)

## Structure

```
url-shortener/
├── app/                # Next.js app routes
│   ├── [code]/route.ts       # GET /:code → redirect
│   ├── api/v1/shorten/route.ts
│   └── health/route.ts
├── lib/                # DB, auth, validation
├── scripts/            # API key management
├── extension/          # Browser extension (coming)
├── deploy/             # Deployment docs
└── docs/               # Architecture docs
```

## API

| Endpoint          | Method | Auth         | Description               |
| ----------------- | ------ | ------------ | ------------------------- |
| `/:code`          | GET    | None         | 302 redirect (or 404/410) |
| `/api/v1/shorten` | POST   | Bearer token | Create short link         |
| `/health`         | GET    | None         | Health check              |

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and API_KEY_PEPPER
npm run db:migrate
npm run dev
```

## Admin Scripts

```bash
npm run admin:create-key "my key"  # Create API key
npm run admin:list-keys            # List all keys
npm run admin:revoke-key <key_id>  # Revoke a key
```

## Docs

- [Architecture & Decisions](./docs/PART1_DOCS_SUMMARY.md)
- [Security](./SECURITY.md)
- [Threat Model](./THREAT_MODEL.md)
- [Deployment](./deploy/vercel-setup.md)
