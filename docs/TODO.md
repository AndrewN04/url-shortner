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

## In Progress

### Part 3: Core Endpoints

- [ ] POST /api/v1/shorten
  - [ ] Bearer token auth (validate API key)
  - [ ] URL validation (http/https only, max length)
  - [ ] SSRF protection (DNS resolution, private IP blocking)
  - [ ] Rate limiting (per-IP and per-token)
  - [ ] TTL validation (60s to 30 days)
  - [ ] Short code generation with collision retry
  - [ ] Return { shortUrl, code, expiresAt }
  - [ ] GET /:code (redirect)
  - [ ] Lookup code in DB
  - [ ] Check expiration
  - [ ] Check revocation
  - [ ] 302 redirect or 404/410

---

## Not Started

### Part 4: Deploy to Vercel

- [ ] Create new Vercel project (separate from a04.dev)
- [ ] Connect Neon integration
- [ ] Add environment variables (API_KEY_PEPPER)
- [ ] Add go.a04.dev domain (CNAME)
- [ ] Generate first API key
- [ ] Verify health endpoint
- [ ] Test shorten + redirect flow

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
