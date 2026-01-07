/**
 * List API Keys Script
 * Run with: npm run admin:list-keys
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenvConfig();

async function listApiKeys() {
    console.log("Listing API keys...\n");

    const databaseUrl = process.env["DATABASE_URL"];
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(databaseUrl);

    try {
        const result = await sql`
      SELECT 
        key_id,
        created_at,
        revoked_at,
        note
      FROM api_keys
      ORDER BY created_at DESC
    `;

        if (result.length === 0) {
            console.log("No API keys found.");
            console.log("\nCreate one with: npm run admin:create-key [note]");
            return;
        }

        console.log(`Found ${result.length} API key(s):\n`);
        console.log("─".repeat(80));

        for (const key of result) {
            const status = key.revoked_at ? "🔴 REVOKED" : "🟢 ACTIVE";
            console.log(`${status}  ${key.key_id}`);
            console.log(`         Created: ${key.created_at}`);
            if (key.revoked_at) {
                console.log(`         Revoked: ${key.revoked_at}`);
            }
            if (key.note) {
                console.log(`         Note:    ${key.note}`);
            }
            console.log("─".repeat(80));
        }
    } catch (error) {
        console.error("Failed to list API keys:", error);
        process.exit(1);
    }
}

listApiKeys().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
