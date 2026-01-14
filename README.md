# URL Shortener - `https://go.a04.dev`

A self-hosted URL shortener built with Next.js and Postgres.

## Features

- Short, expiring links (60 seconds to 14 days TTL)
- Bearer token authentication
- Rate limiting (per-IP and per-token)
- SSRF protection (blocks private IPs)
- Browser extensions for Chrome/Edge and Firefox
- QR code generation
- Admin CLI for key and link management

## Tech Stack

- **Next.js 16** (App Router, Node.js runtime)
- **Neon Postgres** (or any Postgres database)
- **@neondatabase/serverless** (HTTP driver)
- **Vercel** (recommended for deployment)

---

## Self-Hosting Setup

This is a self-hosted project. Follow these steps to deploy your own instance.

### Prerequisites

- **Node.js 18+** installed
- **Git** installed
- **Neon account** (free tier works) or any Postgres database
- **Vercel account** (free tier works) for production deployment
- **(Optional)** Custom domain

### Step 1: Clone the Repository

```bash
git clone https://github.com/AndrewN04/url-shortner.git
cd url-shortner
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Create a new project (e.g., "url-shortener")
3. Copy the connection string from the dashboard
   - It looks like: `postgres://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### Step 4: Generate API Key Pepper

The pepper is a secret used to hash API keys. Generate a 32-byte hex string:

**macOS/Linux:**

```bash
openssl rand -hex 32
```

**Windows (PowerShell):**

```powershell
-join ((1..32) | ForEach-Object { "{0:x2}" -f (Get-Random -Maximum 256) })
```

**Or use Node.js:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value securely - you'll need it for environment variables.

### Step 5: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database connection (from Neon dashboard)
DATABASE_URL=postgres://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Secret for hashing API keys (32-byte hex from Step 4)
API_KEY_PEPPER=your-64-character-hex-string-here

# Maximum TTL for links in seconds
# This is the upper limit - users cannot create links that last longer than this
# Examples:
#   2592000 = 30 days
#   1209600 = 14 days (default)
#   604800  = 7 days
#   86400   = 1 day
# Set this to whatever maximum you want for your instance
MAX_TTL_SECONDS=1209600
```

### Step 6: Run Database Migrations

This creates the required tables (`api_keys` and `links`):

```bash
npm run db:migrate
```

You should see:

```
Applied migration: initial_schema
Applied migration: add_api_key_hash_index
Applied migration: add_link_seq_id
All migrations complete.
```

### Step 7: Create Your First API Key

```bash
npm run admin:create-key -- --note "my-first-key"
```

Output:

```
API Key created successfully!
Key: sk_abc123...xyz
Note: my-first-key
IMPORTANT: Save this key now. It cannot be retrieved later.
```

**Save this key securely!** You'll need it for the extension and API calls.

### Step 8: Test Locally

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`

Test the health endpoint:

```bash
curl http://localhost:3000/health
# {"status":"healthy","timestamp":"..."}
```

Test shortening a URL:

```bash
curl -X POST http://localhost:3000/api/v1/shorten \
  -H "Authorization: Bearer sk_your-key-here" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Step 9: Deploy to Vercel

For detailed deployment instructions, see [deploy/vercel-setup.md](./deploy/vercel-setup.md).

**Quick deployment:**

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. In Vercel project settings, add environment variables:

   - `DATABASE_URL` - Your Neon connection string
   - `API_KEY_PEPPER` - Your 32-byte hex secret
   - `MAX_TTL_SECONDS` - `1209600` (or your preferred max)

4. Deploy

5. (Optional) Add a custom domain in Vercel project settings

### Step 10: Create Production API Key

After deployment, link your local environment to Vercel and create a production key:

```bash
npx vercel link
npx vercel env pull .env.local
npm run admin:create-key -- --note "production"
```

Save this production API key for use with the extension.

---

## Usage

Once your instance is running, you can shorten URLs via the browser extension or command line.

### Browser Extension

The extension provides a convenient popup for shortening the current page URL.

#### Installation

**Chrome/Edge:**

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Navigate to and select the `extension/chrome` folder from this repository
5. The extension icon appears in your toolbar

**Firefox:**

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to `extension/firefox` and select any file (e.g., `manifest.json`)
4. The extension icon appears in your toolbar

> Note: Firefox temporary add-ons are removed when Firefox closes. For permanent installation, the extension would need to be signed by Mozilla.

#### Configuration

1. Click the extension icon in your browser toolbar
2. You'll see "No API key configured" - click "Configure API Key"
3. Enter your API key (the `sk_...` value from Step 7 or 10)
4. Click "Save"

#### Using the Extension

1. Navigate to any webpage you want to shorten
2. Click the extension icon
3. The current page URL appears in the input (editable if needed)
4. Adjust expiration time if desired:
   - Days (0-14)
   - Hours (0-23)
   - Minutes (0-59)
   - Seconds (0-59)
5. Click "Shorten"
6. The result shows:
   - Shortened URL (automatically copied to clipboard)
   - Expiration date and time
   - QR code for the shortened URL
7. Click "Download QR" to save the QR code as a PNG

### Command Line (cURL)

For scripting or automation.

#### Shorten a URL

```bash
curl -X POST https://your-domain.com/api/v1/shorten \
  -H "Authorization: Bearer sk_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/some/long/path"}'
```

**Response:**

```json
{
  "shortUrl": "https://your-domain.com/abc123XYZ",
  "code": "abc123XYZ",
  "expiresAt": "2026-01-27T12:00:00.000Z"
}
```

#### Custom Expiration (TTL)

TTL is specified in seconds. Minimum is 60 seconds. Maximum depends on your `MAX_TTL_SECONDS` configuration (default: 1,209,600 = 14 days).

```bash
# Expires in 1 hour
curl -X POST https://your-domain.com/api/v1/shorten \
  -H "Authorization: Bearer sk_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "ttl": 3600}'

# Expires in 7 days
curl -X POST https://your-domain.com/api/v1/shorten \
  -H "Authorization: Bearer sk_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "ttl": 604800}'
```

#### Test a Shortened URL

```bash
curl -I https://your-domain.com/abc123XYZ
```

Response:

```
HTTP/2 302
location: https://example.com/some/long/path
```

---

## Admin Scripts

Manage your API keys and links from the command line.

### API Key Management

```bash
# Create a new API key
npm run admin:create-key -- --note "descriptive name"

# List all API keys (shows ID, note, created date, status)
npm run admin:list-keys

# Revoke an API key (by ID from list-keys)
npm run admin:revoke-key -- <key_id>
```

### Link Management

```bash
# List all active (non-expired, non-revoked) links
npm run admin:list-links

# Revoke a single link by its short code
npm run admin:revoke-link -- --code abc123XYZ

# Revoke multiple links by their sequential IDs
npm run admin:revoke-link -- --id 1,2,3,4,5
```

---

## API Reference

### Endpoints

| Endpoint          | Method | Auth         | Description              |
| ----------------- | ------ | ------------ | ------------------------ |
| `/:code`          | GET    | None         | Redirect to original URL |
| `/api/v1/shorten` | POST   | Bearer token | Create a shortened link  |
| `/health`         | GET    | None         | Health check             |

### POST /api/v1/shorten

**Headers:**

- `Authorization: Bearer <api_key>` (required)
- `Content-Type: application/json` (required)

**Request Body:**

| Field | Type   | Required | Description                                             |
| ----- | ------ | -------- | ------------------------------------------------------- |
| `url` | string | Yes      | URL to shorten (must be http or https)                  |
| `ttl` | number | No       | Time-to-live in seconds (min 60, max = MAX_TTL_SECONDS) |

> **Note:** The maximum TTL is set by the `MAX_TTL_SECONDS` environment variable. Default is 1,209,600 (14 days), but you can configure this to any value when self-hosting.

**Success Response (200):**

| Field       | Type   | Description                   |
| ----------- | ------ | ----------------------------- |
| `shortUrl`  | string | Full shortened URL            |
| `code`      | string | Short code portion            |
| `expiresAt` | string | ISO 8601 expiration timestamp |

**Error Responses:**

| Status | Error                          | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| 400    | `Invalid URL`                  | URL is malformed or not http/s |
| 400    | `TTL must be between...`       | TTL out of allowed range       |
| 401    | `Missing authorization header` | No Bearer token provided       |
| 401    | `Invalid API key`              | API key not found or revoked   |
| 429    | `Rate limit exceeded`          | Too many requests              |
| 500    | `Internal server error`        | Server-side error              |

### GET /:code

**Success Response:**

- `302 Found` with `Location` header pointing to original URL

**Error Responses:**

- `404 Not Found` - Code doesn't exist
- `410 Gone` - Link expired or was revoked

---

## Project Structure

```
url-shortener/
├── app/                      # Next.js App Router
│   ├── [code]/route.ts       # GET /:code (redirect)
│   ├── api/v1/shorten/       # POST /api/v1/shorten
│   ├── health/route.ts       # GET /health
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── lib/                      # Shared utilities
│   ├── config.ts             # Environment validation
│   ├── crypto.ts             # Hashing, code generation
│   ├── db.ts                 # Database connection
│   ├── migrations.ts         # Schema migrations
│   ├── rate-limit.ts         # Rate limiting
│   └── url-validator.ts      # URL & SSRF validation
├── scripts/                  # Admin CLI scripts
│   ├── create-key.ts
│   ├── list-keys.ts
│   ├── revoke-key.ts
│   ├── list-links.ts
│   ├── revoke-link.ts
│   └── migrate.ts
├── extension/                # Browser extensions
│   ├── chrome/               # Chrome/Edge (Manifest V3)
│   └── firefox/              # Firefox (Manifest V2)
├── public/                   # Static assets
├── deploy/                   # Deployment documentation
├── docs/                     # Architecture documentation
└── __tests__/                # Test suite
```

---

## Documentation

- [Architecture & Decisions](./docs/PART1_DOCS_SUMMARY.md)
- [Security Policies](./SECURITY.md)
- [Threat Model](./THREAT_MODEL.md)
- [Deployment Guide](./deploy/vercel-setup.md)
