/**
 * List API Keys Script
 * Run with: npm run admin:list-keys
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

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
        note
      FROM api_keys
      WHERE revoked_at IS NULL
      ORDER BY created_at DESC
    `;

        if (result.length === 0) {
            console.log("No active API keys found.");
            console.log("\nCreate one with: npm run admin:create-key [note]");
            return;
        }

        console.log(`Found ${result.length} active API key(s):\n`);
        console.log("─".repeat(80));

        for (const key of result) {
            console.log(`ACTIVE  ${key.key_id}`);
            console.log(`        Created: ${key.created_at}`);
            if (key.note) {
                console.log(`        Note:    ${key.note}`);
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
