/**
 * Revoke a shortened link
 * Run with: npm run admin:revoke-link -- --code <code>
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
// Fallback to .env if .env.local doesn't exist
dotenvConfig({ path: ".env" });

interface LinkRecord {
    id: string;
    code: string;
    url: string;
    expires_at: string | null;
    revoked_at: string | null;
    created_at: string;
}

async function revokeLink() {
    const args = process.argv.slice(2);
    const codeIndex = args.indexOf("--code");

    if (codeIndex === -1 || !args[codeIndex + 1]) {
        console.error("Usage: npm run admin:revoke-link -- --code <code>");
        console.error("Example: npm run admin:revoke-link -- --code abc123");
        process.exit(1);
    }

    const code = args[codeIndex + 1]!;

    const databaseUrl = process.env["DATABASE_URL"];
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(databaseUrl);

    // Find the link
    const result = await sql`
        SELECT id, code, url, expires_at, revoked_at, created_at
        FROM links
        WHERE code = ${code}
        LIMIT 1
    `;

    if (result.length === 0) {
        console.error(`❌ Link not found: ${code}`);
        process.exit(1);
    }

    const link = result[0] as LinkRecord;

    if (link.revoked_at) {
        console.log(`⚠️  Link already revoked at: ${link.revoked_at}`);
        console.log(`   URL: ${link.url}`);
        process.exit(0);
    }

    // Revoke the link
    await sql`
        UPDATE links
        SET revoked_at = NOW()
        WHERE id = ${link.id}
    `;

    console.log(`✓ Link revoked successfully`);
    console.log(`  Code: ${link.code}`);
    console.log(`  URL: ${link.url}`);
    console.log(`  Created: ${link.created_at}`);
}

revokeLink().catch((err) => {
    console.error("Failed to revoke link:", err);
    process.exit(1);
});
