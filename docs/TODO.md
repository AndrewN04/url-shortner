# Project TODO

## Completed

### Part 1: Architecture & Docs ✅

- [x] Research Vercel, Neon, Next.js docs
- [x] Create PART1_DOCS_SUMMARY.md
- [x] Create THREAT_MODEL.md
- [x] Create SECURITY.md
- [x] Create README.md
- [x] Create deploy/vercel-setup.md

### Part 2: Next.js Skeleton ✅

- [x] Initialize with create-next-app (Tailwind, Turbopack)
- [x] Set up TypeScript strict mode
- [x] Create lib/config.ts (environment validation)
- [x] Create lib/db.ts (Neon connection)
- [x] Create lib/crypto.ts (API key hashing, short code generation)
- [x] Create lib/migrations.ts (schema definitions)
- [x] Create admin scripts (create-key, revoke-key, list-keys, migrate)
- [x] Create GET /health endpoint
- [x] Create landing page (GET /)
- [x] Add security headers in next.config.ts
- [x] Write tests (36 passing)

---

### Part 3: Core Endpoints ✅

- [x] POST /api/v1/shorten
  - [x] Bearer token auth (validate API key)
  - [x] URL validation (http/https only, max length)
  - [x] SSRF protection (DNS resolution, private IP blocking)
  - [x] Rate limiting (per-IP and per-token)
  - [x] TTL validation (60s to 30 days)
  - [x] Short code generation with collision retry
  - [x] Return { shortUrl, code, expiresAt }
- [x] GET /:code (redirect)
  - [x] Lookup code in DB
  - [x] Check expiration
  - [x] Check revocation
  - [x] 302 redirect or 404/410
- [x] Admin scripts for link management
  - [x] npm run admin:list-links
  - [x] npm run admin:revoke-link
- [x] Package review & audit (69 tests passing)

---

### Part 4: Deploy to Vercel ✅

- [x] Create new Vercel project (separate from a04.dev)
- [x] Connect Neon integration
- [x] Add environment variables (API_KEY_PEPPER, MAX_TTL_SECONDS)
- [x] Add go.a04.dev domain (CNAME)
- [x] Generate production API key
- [x] Verify health endpoint
- [x] Test shorten + redirect flow

---

## Not Started

### Part 5: Browser Extension

- [ ] Chrome/Edge manifest v3
- [ ] Firefox manifest v2
- [ ] Popup UI (current tab URL, shorten button, copy result)
- [ ] Options page (API key storage)
- [ ] Background service worker
- [ ] Test in both browsers

### Part 6: Final Polish

- [ ] GitHub Actions CI (lint, typecheck, test)
- [ ] Update README with usage examples
- [ ] Final security review
- [ ] Tag v1.0.0 release
