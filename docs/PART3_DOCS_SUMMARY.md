# Part 3: Core Endpoints - Implementation Summary

## Completed: January 13, 2026

This document summarizes the implementation of the core URL shortener endpoints.

---

## Endpoints Implemented

### POST /api/v1/shorten

Creates a shortened URL with full security controls.

**Request:**

```http
POST /api/v1/shorten
Authorization: Bearer sk_...
Content-Type: application/json

{
  "url": "https://example.com/long-path",
  "ttl": 86400  // optional, seconds (default: 30 days)
}
```

**Response (201):**

```json
{
  "shortUrl": "https://go.a04.dev/abc123",
  "code": "abc123",
  "expiresAt": "2026-01-14T12:00:00.000Z"
}
```

**Security Features:**

- Bearer token authentication (API key required)
- URL format validation (http/https only, max 2048 chars)
- SSRF protection via DNS resolution + private IP blocking
- Rate limiting: 100 req/min per IP, 1000 req/min per key
- TTL bounds: 60 seconds to 30 days
- Collision retry (up to 5 attempts)

### GET /:code

Redirects to the original URL or returns error status.

**Responses:**

- `302` - Redirect to target URL
- `404` - Code not found
- `410` - Link expired or revoked

**Headers on redirect:**

```
Cache-Control: private, max-age=0, no-cache
X-Robots-Tag: noindex
```

---

## New Library Modules

### lib/url-validation.ts

URL validation with SSRF protection.

**Functions:**

- `validateUrl(url)` - Full validation pipeline
- `validateUrlFormat(url)` - Syntax + scheme check
- `validateUrlDns(url)` - DNS resolution + IP check
- `isPrivateIp(ip)` - Detects RFC 1918, loopback, link-local
- `isBlockedHostname(hostname)` - Blocks localhost variants

**Test coverage:** 20 tests

### lib/rate-limit.ts

Database-backed rate limiting with sliding window.

**Functions:**

- `checkRateLimit(sql, identifier)` - Check + increment
- `ipRateLimitId(ip)` - Format IP identifier
- `keyRateLimitId(keyId)` - Format key identifier
- `getClientIp(headers)` - Extract from X-Forwarded-For

**Limits:**

- IP: 100 requests/minute
- Key: 1000 requests/minute

**Test coverage:** 7 tests

### lib/auth.ts

Bearer token authentication.

**Functions:**

- `authenticateRequest(request, sql)` - Full auth flow
- `extractBearerToken(authHeader)` - Parse header
- `errorResponse(message, status)` - JSON error
- `unauthorizedResponse(message)` - 401 response

**Test coverage:** 6 tests

---

## Admin Scripts Added

### npm run admin:list-links

Lists all shortened links with status (active/expired/revoked).

### npm run admin:revoke-link -- --code \<code\>

Soft-deletes a link by setting `revoked_at` timestamp.

---

## Test Results

```
✓ lib/migrations.test.ts (11 tests)
✓ lib/config.test.ts (10 tests)
✓ lib/url-validation.test.ts (20 tests)
✓ lib/rate-limit.test.ts (7 tests)
✓ lib/auth.test.ts (6 tests)
✓ lib/crypto.test.ts (15 tests)

Test Files  6 passed (6)
     Tests  69 passed (69)
```

---

## Package Review

All packages verified against latest documentation:

| Package                  | Version  | Status                             |
| ------------------------ | -------- | ---------------------------------- |
| @neondatabase/serverless | 1.0.2    | ✅ Using latest patterns           |
| next                     | 16.1.1   | ✅ Using App Router best practices |
| crypto (Node.js)         | built-in | ✅ HMAC-SHA256 + timingSafeEqual   |

---

## Verification Checklist

- [x] `npm run lint` - No errors
- [x] `npm run typecheck` - No errors
- [x] `npm test` - 69/69 passing
- [x] `npm run build` - Successful
- [x] Local testing - All endpoints working

---

## Next: Part 4

Deploy to Vercel with go.a04.dev domain.
