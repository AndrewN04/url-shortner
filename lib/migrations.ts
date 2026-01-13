/**
 * Database migration system
 * Simple, auditable SQL migrations
 */

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: "initial_schema",
    sql: `
      -- API Keys table
      CREATE TABLE IF NOT EXISTS api_keys (
        key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ,
        note TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
      
      -- Links table
      CREATE TABLE IF NOT EXISTS links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        revoked_at TIMESTAMPTZ,
        created_by_key_id UUID NOT NULL REFERENCES api_keys(key_id)
      );
      
      -- Primary lookup index for redirects (code -> url)
      CREATE UNIQUE INDEX IF NOT EXISTS idx_links_code ON links(code);
      
      -- Index for cleanup queries on expired links
      CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links(expires_at) 
        WHERE expires_at IS NOT NULL;
      
      -- Migrations tracking table
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    version: 2,
    name: "rate_limits_table",
    sql: `
      -- Rate limiting table (DB-backed for Vercel compatibility)
      CREATE TABLE IF NOT EXISTS rate_limits (
        id TEXT PRIMARY KEY, -- format: "ip:{ip}" or "token:{key_id}"
        window_start TIMESTAMPTZ NOT NULL,
        request_count INTEGER NOT NULL DEFAULT 1
      );
      
      -- Index for cleanup of old rate limit entries
      CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
    `,
  },
  {
    version: 3,
    name: "add_link_seq_id",
    sql: `
      -- Add sequential ID for easier link management
      ALTER TABLE links ADD COLUMN IF NOT EXISTS seq_id SERIAL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_links_seq_id ON links(seq_id);
    `,
  },
];
