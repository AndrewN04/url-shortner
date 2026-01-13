/**
 * List all shortened links
 * Run with: npm run admin:list-links
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
// Fallback to .env if .env.local doesn't exist
dotenvConfig({ path: ".env" });

interface LinkRecord {
    seq_id: number;
    code: string;
    url: string;
    expires_at: string | null;
    revoked_at: string | null;
    created_at: string;
}

async function listLinks() {
    const databaseUrl = process.env["DATABASE_URL"];
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(databaseUrl);

    const result = await sql`
        SELECT seq_id, code, url, expires_at, revoked_at, created_at
        FROM links
        WHERE revoked_at IS NULL
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY seq_id DESC
        LIMIT 50
    `;

    if (result.length === 0) {
        console.log("No active links found.");
        return;
    }

    console.log(`Found ${result.length} active link(s):\n`);

    for (const row of result as LinkRecord[]) {
        console.log(`[${row.seq_id}] ${row.code}`);
        console.log(`   URL: ${row.url}`);
        console.log(`   Created: ${row.created_at}`);
        if (row.expires_at) {
            console.log(`   Expires: ${row.expires_at}`);
        }
        console.log();
    }
}

listLinks().catch((err) => {
    console.error("Failed to list links:", err);
    process.exit(1);
});
