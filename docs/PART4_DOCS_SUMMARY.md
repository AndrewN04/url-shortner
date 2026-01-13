# Part 4: Deploy to Vercel - Summary

## Completed: January 13, 2026

This document summarizes the deployment of the URL shortener to production.

---

## Deployment Overview

| Component             | Status              |
| --------------------- | ------------------- |
| Vercel Project        | ✅ Deployed         |
| Neon Database         | ✅ Connected        |
| Environment Variables | ✅ Configured       |
| Custom Domain         | ✅ go.a04.dev       |
| SSL Certificate       | ✅ Auto-provisioned |
| Migrations            | ✅ Applied          |
| API Key               | ✅ Generated        |

---

## Production URL

**https://go.a04.dev**

---

## Configuration

### Environment Variables

| Variable          | Description                                   |
| ----------------- | --------------------------------------------- |
| `DATABASE_URL`    | Neon Postgres connection (auto-set by Vercel) |
| `API_KEY_PEPPER`  | 32-byte hex secret for HMAC hashing           |
| `MAX_TTL_SECONDS` | `1209600` (14 days)                           |

### DNS Configuration

```
go  CNAME  cname.vercel-dns.com
```

---

## Deployment Steps Completed

1. **Pushed code to GitHub** (`AndrewN04/url-shortner`)
2. **Created Vercel project** via dashboard import
3. **Connected Neon database** via Vercel Storage integration
4. **Added environment variables** (`API_KEY_PEPPER`, `MAX_TTL_SECONDS`)
5. **Configured domain** (`go.a04.dev` with CNAME)
6. **Linked local project** (`npx vercel link`)
7. **Pulled production env vars** to `.env.local`
8. **Verified migrations** (already applied)
9. **Created production API key**

---

## Production Testing

### Health Check

```bash
curl https://go.a04.dev/health
# {"status":"healthy","timestamp":"..."}
```

### Shorten URL

```bash
curl -X POST https://go.a04.dev/api/v1/shorten \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/test"}'

# {"shortUrl":"https://go.a04.dev/56VYJDcZ3nhK","code":"56VYJDcZ3nhK","expiresAt":"..."}
```

### Redirect

```
https://go.a04.dev/56VYJDcZ3nhK → 302 → https://example.com/test
```

All endpoints verified working ✅

---

## Build Output

```
Route (app)
┌ ○ /              (Static)
├ ○ /_not-found    (Static)
├ ƒ /[code]        (Dynamic)
├ ƒ /api/v1/shorten (Dynamic)
└ ƒ /health        (Dynamic)
```

---

## Useful Commands

```bash
# Link local project to Vercel
npx vercel link

# Pull production env vars
npx vercel env pull .env.local

# Deploy from CLI
npx vercel --prod

# View logs
npx vercel logs
```

---

## Next: Part 5

Build browser extension for Chrome/Edge and Firefox.
