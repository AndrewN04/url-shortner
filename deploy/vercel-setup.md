# Deployment Guide

## 1. Create Vercel Project

```bash
npx vercel --prod
```

Or via dashboard: vercel.com/new → Import repo → Framework: Next.js (auto-detected)

## 2. Add Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add `go.a04.dev`
3. Configure DNS:
   ```
   go  CNAME  cname.vercel-dns.com
   ```

## 3. Add Neon Database

1. Project → Storage → Connect Database
2. Select Neon Postgres → Install
3. Create database, connect to all environments
4. Pull env locally:
   ```bash
   npx vercel env pull .env.local
   ```

## 4. Add Environment Variables

Generate pepper:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add in Vercel → Settings → Environment Variables:

- `API_KEY_PEPPER`: (generated value)
- `MAX_TTL_SECONDS`: `1209600`

## 5. Run Migrations

```bash
# Local
npm run db:migrate

# Production (via Neon Console SQL Editor)
# Or add to package.json:
"vercel-build": "npm run db:migrate && npm run build"
```

## 6. Verify

```bash
curl https://go.a04.dev/health
# {"status":"healthy"}
```

## 7. Create API Key

```bash
npm run admin:create-key "Extension"
# Save the output key securely!
```

## Troubleshooting

| Issue               | Fix                                            |
| ------------------- | ---------------------------------------------- |
| Domain 404          | Check domain added to correct project          |
| DB connection error | Verify `DATABASE_URL` set: `npx vercel env ls` |
| SSL invalid         | Wait 5-10 min after adding domain              |
