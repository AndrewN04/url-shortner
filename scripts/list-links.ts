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
        SELECT code, url, expires_at, revoked_at, created_at
        FROM links
        ORDER BY created_at DESC
        LIMIT 50
    `;

    if (result.length === 0) {
        console.log("No links found.");
        return;
    }

    console.log(`Found ${result.length} link(s):\n`);

    for (const row of result as LinkRecord[]) {
        const status = row.revoked_at
            ? "🚫 REVOKED"
            : row.expires_at && new Date(row.expires_at) < new Date()
                ? "⏰ EXPIRED"
                : "✅ ACTIVE";

        console.log(`${status} ${row.code}`);
        console.log(`   URL: ${row.url}`);
        console.log(`   Created: ${row.created_at}`);
        if (row.expires_at) {
            console.log(`   Expires: ${row.expires_at}`);
        }
        if (row.revoked_at) {
            console.log(`   Revoked: ${row.revoked_at}`);
        }
        console.log();
    }
}

listLinks().catch((err) => {
    console.error("Failed to list links:", err);
    process.exit(1);
});
