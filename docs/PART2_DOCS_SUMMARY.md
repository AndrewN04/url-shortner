# Part 2: Next.js Skeleton - Summary

## What Was Built

A production-ready Next.js 16 application skeleton with:

- **Scaffolding**: `create-next-app` with Tailwind CSS and Turbopack
- **Database**: Neon serverless driver with HTTP-based queries
- **Security**: API key hashing with HMAC-SHA256 + pepper
- **Admin tooling**: CLI scripts for key management
- **Testing**: Vitest with 36 passing tests

---

## File Structure

```
url-shortener/
├── app/
│   ├── globals.css          # Tailwind styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page (GET /)
│   └── health/
│       └── route.ts         # Health check endpoint
├── lib/
│   ├── config.ts            # Environment validation
│   ├── config.test.ts       # Config tests
│   ├── crypto.ts            # API key & short code generation
│   ├── crypto.test.ts       # Crypto tests
│   ├── db.ts                # Neon connection (cached)
│   ├── migrations.ts        # Schema definitions
│   └── migrations.test.ts   # Migration tests
├── scripts/
│   ├── create-api-key.ts    # Generate new API key
│   ├── revoke-api-key.ts    # Revoke existing key
│   ├── list-api-keys.ts     # List all keys
│   └── migrate.ts           # Run migrations
├── next.config.ts           # Security headers
├── tsconfig.json            # Strict TypeScript
├── vitest.config.ts         # Test configuration
└── package.json             # Dependencies & scripts
```

---

## Database Schema

### api_keys

| Column     | Type        | Notes            |
| ---------- | ----------- | ---------------- |
| key_id     | UUID        | Primary key      |
| key_hash   | TEXT        | HMAC-SHA256 hash |
| created_at | TIMESTAMPTZ | Auto             |
| revoked_at | TIMESTAMPTZ | Nullable         |
| note       | TEXT        | Optional label   |

### links

| Column            | Type        | Notes            |
| ----------------- | ----------- | ---------------- |
| id                | UUID        | Primary key      |
| code              | TEXT        | Unique, 12 chars |
| url               | TEXT        | Target URL       |
| created_at        | TIMESTAMPTZ | Auto             |
| expires_at        | TIMESTAMPTZ | Nullable         |
| revoked_at        | TIMESTAMPTZ | Nullable         |
| created_by_key_id | UUID        | FK to api_keys   |

### rate_limits

| Column        | Type        | Notes                     |
| ------------- | ----------- | ------------------------- |
| id            | TEXT        | "ip:{ip}" or "token:{id}" |
| window_start  | TIMESTAMPTZ | Current window            |
| request_count | INTEGER     | Requests in window        |

---

## Key Design Decisions

| Decision                    | Rationale                                                   |
| --------------------------- | ----------------------------------------------------------- |
| Node.js runtime             | Need `crypto.timingSafeEqual`, future `dns` module for SSRF |
| HMAC-SHA256 with pepper     | Industry standard for API key hashing                       |
| 12-char codes               | 58^12 ≈ 1.4×10^21 keyspace, enumeration-resistant           |
| Rejection sampling          | Eliminates modulo bias in code generation                   |
| HTTP driver (not WebSocket) | Stateless, perfect for serverless                           |

---

## npm Scripts

| Script             | Command                         | Purpose            |
| ------------------ | ------------------------------- | ------------------ |
| `dev`              | `next dev --turbopack`          | Development server |
| `build`            | `next build`                    | Production build   |
| `start`            | `next start`                    | Production server  |
| `lint`             | `eslint`                        | Lint check         |
| `typecheck`        | `tsc --noEmit`                  | Type check         |
| `test`             | `vitest run`                    | Run tests          |
| `db:migrate`       | `tsx scripts/migrate.ts`        | Run migrations     |
| `admin:create-key` | `tsx scripts/create-api-key.ts` | Create API key     |
| `admin:revoke-key` | `tsx scripts/revoke-api-key.ts` | Revoke API key     |
| `admin:list-keys`  | `tsx scripts/list-api-keys.ts`  | List API keys      |

---

## Test Coverage

| File               | Tests | Focus                                               |
| ------------------ | ----- | --------------------------------------------------- |
| config.test.ts     | 10    | Env validation, defaults                            |
| crypto.test.ts     | 15    | Key generation, hashing, verification, distribution |
| migrations.test.ts | 11    | Schema structure, migration ordering                |

**Total: 36 tests passing**

---

## Audit Changes

1. **Fixed modulo bias** in `generateShortCode()` - now uses rejection sampling
2. **Updated docs** to remove Drizzle references (not used)
3. **Removed unused** `public/` folder
4. **Added distribution test** for short code uniformity
