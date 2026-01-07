# Part 1: Architecture & Decisions

## Docs Referenced

| Topic                  | Source                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Vercel Domains         | [vercel.com/docs/projects/domains](https://vercel.com/docs/projects/domains/add-a-domain)                   |
| Neon + Vercel          | [neon.com/docs/guides/vercel-managed-integration](https://neon.com/docs/guides/vercel-managed-integration)  |
| Neon Serverless Driver | [neon.com/docs/serverless/serverless-driver](https://neon.com/docs/serverless/serverless-driver)            |
| Next.js Route Handlers | [nextjs.org/docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)             |
| Next.js Runtimes       | [nextjs.org/docs](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) |

---

## Key Decisions

| Decision    | Choice                   | Why                                                         |
| ----------- | ------------------------ | ----------------------------------------------------------- |
| Runtime     | Node.js                  | Need `dns` module for SSRF checks, `crypto.timingSafeEqual` |
| DB Client   | @neondatabase/serverless | HTTP driver, low latency, works with Vercel serverless      |
| Code length | 12 chars                 | 58^12 keyspace, enumeration-resistant                       |
| Max TTL     | 30 days                  | Balance utility vs abuse                                    |

---

## Domain Setup

```
a04.dev      → Portfolio (existing)
go.a04.dev   → Shortener (new project, CNAME record)
```

Add `go.a04.dev` to shortener project only. DNS: `go CNAME cname.vercel-dns.com`

---

## Environment Variables

**Auto-injected (Neon integration):**

- `DATABASE_URL` — pooled (use for queries)
- `DATABASE_URL_UNPOOLED` — direct (use for migrations)

**Manual:**

- `API_KEY_PEPPER` — server secret for HMAC key hashing
- `MAX_TTL_SECONDS` — 2592000 (30 days)

---

## Database Schema

```sql
-- links
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(24) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by_key_id VARCHAR(32) REFERENCES api_keys(key_id)
);

-- api_keys
CREATE TABLE api_keys (
  key_id VARCHAR(32) PRIMARY KEY,
  key_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  note VARCHAR(255)
);

-- rate_limits
CREATE TABLE rate_limits (
  identifier VARCHAR(64),
  bucket TIMESTAMPTZ,
  count INTEGER DEFAULT 1,
  PRIMARY KEY (identifier, bucket)
);
```

---

## Security Checklist

- [x] Token hashing with pepper + constant-time compare
- [x] SSRF: DNS resolution + private IP blocking
- [x] http/https only schemes
- [x] Rate limiting per-IP and per-token
- [x] 12-char crypto-random codes
- [x] Expiration enforcement server-side
