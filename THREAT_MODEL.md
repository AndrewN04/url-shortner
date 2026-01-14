# Threat Model

Personal URL shortener at `go.a04.dev`. Single authenticated user creates links; anyone can use them.

## Assets

| Asset            | Impact if Compromised                |
| ---------------- | ------------------------------------ |
| API tokens       | Attacker creates malicious redirects |
| API_TOKEN_PEPPER | All tokens forgeable                 |
| DATABASE_URL     | Full DB access                       |

## Threats & Mitigations

### T1: Token Theft

- TLS only (Vercel enforces)
- SHA-256 hash with pepper, never plaintext
- Never log Authorization header
- Token rotation capability

### T2: SSRF

- http/https schemes only
- Resolve DNS before storing
- Block private IPs: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `100.64.0.0/10`, IPv6 loopback/ULA/link-local
- Block if ANY resolved IP is private

### T3: DNS Rebinding

- Resolved at creation time only (not redirect)
- **Accepted risk**: affects only clicking user's browser, not server

### T4: Link Enumeration

- 12-char codes (58^12 ≈ 10^21 keyspace)
- `crypto.randomBytes`, not sequential

### T5: Abuse

- Rate limit: 10/min per token, 30/min per IP
- Token revocation
- Link expiration (max 14 days)

### T6: Expired/Revoked Links

- Server-side check on every redirect
- 410 Gone for expired, 404 for revoked
- `Cache-Control: no-store`

## Incident Response

**Token compromised:**

1. Run `npm run token:revoke <key_id>`
2. Review recent links
3. Create new token

**Pepper compromised:**

1. Rotate `API_TOKEN_PEPPER`
2. Re-create all tokens
