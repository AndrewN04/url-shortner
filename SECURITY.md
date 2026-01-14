# Security

## Authentication

- Link creation: `Authorization: Bearer <token>`
- Tokens hashed with SHA-256 + server pepper
- Constant-time comparison (`crypto.timingSafeEqual`)

## URL Validation

**Allowed:** `http://`, `https://` only

**Blocked IPs (SSRF protection):**

- `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- `169.254.0.0/16`, `100.64.0.0/10`
- IPv6: `::1`, `fc00::/7`, `fe80::/10`

DNS is resolved at creation; blocked if any IP is private.

## Rate Limiting

- 10 links/min per token
- 30 requests/min per IP

## Token Management

Format: `sk_<64-hex-chars>` (full key hashed with HMAC-SHA256)

```bash
# Create
npm run admin:create-key "my key"

# List
npm run admin:list-keys

# Revoke
npm run admin:revoke-key <key_id>
```

## Link Expiration

- Min: 60s, Max: 14 days, Default: none
- Expired → 410 Gone
- Revoked → 404 Not Found

## Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store
```

## Logging

**Logged:** timestamp, method, path, status, IP, duration  
**NOT logged:** tokens, auth headers, full URLs, bodies
