/**
 * Revoke API Key Script
 * Run with: npm run admin:revoke-key <key_id>
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

async function revokeApiKey() {
    const keyId = process.argv[2];

    if (!keyId) {
        console.error("Usage: npm run admin:revoke-key <key_id>");
        console.error("\nUse 'npm run admin:list-keys' to see available key IDs.");
        process.exit(1);
    }

    console.log(`Revoking API key: ${keyId}...\n`);

    const databaseUrl = process.env["DATABASE_URL"];
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(databaseUrl);

    try {
        const result = await sql`
      UPDATE api_keys 
      SET revoked_at = NOW()
      WHERE key_id = ${keyId}
        AND revoked_at IS NULL
      RETURNING key_id, note, revoked_at
    `;

        if (result.length === 0) {
            const existing = await sql`
        SELECT key_id, revoked_at FROM api_keys WHERE key_id = ${keyId}
      `;

            if (existing.length === 0) {
                console.error("✗ Key not found.");
            } else if (existing[0]?.revoked_at) {
                console.error("✗ Key was already revoked.");
            }
            process.exit(1);
        }

        const { note, revoked_at } = result[0]!;

        console.log("API key revoked successfully.");
        console.log(`  Key ID:     ${keyId}`);
        console.log(`  Note:       ${note ?? "(none)"}`);
        console.log(`  Revoked at: ${revoked_at}`);
    } catch (error) {
        console.error("Failed to revoke API key:", error);
        process.exit(1);
    }
}

revokeApiKey().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
