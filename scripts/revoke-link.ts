/**
 * Revoke shortened link(s)
 * Run with: npm run admin:revoke-link -- --id <id1,id2,...>
 *       or: npm run admin:revoke-link -- --code <code>
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
// Fallback to .env if .env.local doesn't exist
dotenvConfig({ path: ".env" });

interface LinkRecord {
    id: string;
    seq_id: number;
    code: string;
    url: string;
    expires_at: string | null;
    revoked_at: string | null;
    created_at: string;
}

async function revokeLink() {
    const args = process.argv.slice(2);
    const idIndex = args.indexOf("--id");
    const codeIndex = args.indexOf("--code");

    if (idIndex === -1 && codeIndex === -1) {
        console.error("Usage: npm run admin:revoke-link -- --id <id1,id2,...>");
        console.error("   or: npm run admin:revoke-link -- --code <code>");
        console.error("");
        console.error("Examples:");
        console.error("  npm run admin:revoke-link -- --id 5");
        console.error("  npm run admin:revoke-link -- --id 1,2,3,5");
        console.error("  npm run admin:revoke-link -- --code abc123");
        process.exit(1);
    }

    const databaseUrl = process.env["DATABASE_URL"];
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(databaseUrl);

    // Revoke by ID(s)
    if (idIndex !== -1 && args[idIndex + 1]) {
        const idsString = args[idIndex + 1]!;
        const ids = idsString.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

        if (ids.length === 0) {
            console.error("No valid IDs provided");
            process.exit(1);
        }

        console.log(`Revoking ${ids.length} link(s)...\n`);

        for (const seqId of ids) {
            const result = await sql`
                SELECT id, seq_id, code, url, expires_at, revoked_at, created_at
                FROM links
                WHERE seq_id = ${seqId}
                LIMIT 1
            `;

            if (result.length === 0) {
                console.log(`[${seqId}] Link not found`);
                continue;
            }

            const link = result[0] as LinkRecord;

            if (link.revoked_at) {
                console.log(`[${seqId}] Already revoked: ${link.code}`);
                continue;
            }

            await sql`
                UPDATE links
                SET revoked_at = NOW()
                WHERE id = ${link.id}
            `;

            console.log(`✓ [${seqId}] Revoked: ${link.code} → ${link.url.substring(0, 50)}...`);
        }

        console.log("\nDone!");
        return;
    }

    // Revoke by code (legacy)
    if (codeIndex !== -1 && args[codeIndex + 1]) {
        const code = args[codeIndex + 1]!;

        const result = await sql`
            SELECT id, seq_id, code, url, expires_at, revoked_at, created_at
            FROM links
            WHERE code = ${code}
            LIMIT 1
        `;

        if (result.length === 0) {
            console.error(`Link not found: ${code}`);
            process.exit(1);
        }

        const link = result[0] as LinkRecord;

        if (link.revoked_at) {
            console.log(`Link already revoked at: ${link.revoked_at}`);
            console.log(`   URL: ${link.url}`);
            process.exit(0);
        }

        await sql`
            UPDATE links
            SET revoked_at = NOW()
            WHERE id = ${link.id}
        `;

        console.log(`Link revoked successfully`);
        console.log(`  ID: ${link.seq_id}`);
        console.log(`  Code: ${link.code}`);
        console.log(`  URL: ${link.url}`);
        console.log(`  Created: ${link.created_at}`);
        return;
    }

    console.error("Missing value for --id or --code");
    process.exit(1);
}

revokeLink().catch((err) => {
    console.error("Failed to revoke link:", err);
    process.exit(1);
});
