/**
 * Create API Key Script
 * Run with: npm run admin:create-key [note]
 *
 * The generated key is printed ONCE and cannot be recovered.
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { generateApiKey, hashApiKey } from "../lib/crypto";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

async function createApiKey() {
    const note = process.argv[2] ?? null;

    console.log("Creating new API key...\n");

    const databaseUrl = process.env["DATABASE_URL"];
    const pepper = process.env["API_KEY_PEPPER"];

    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }
    if (!pepper) {
        throw new Error("API_KEY_PEPPER environment variable is required");
    }

    const sql = neon(databaseUrl);
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    try {
        const result = await sql`
      INSERT INTO api_keys (key_hash, note)
      VALUES (${keyHash}, ${note})
      RETURNING key_id, created_at
    `;

        const { key_id, created_at } = result[0]!;

        console.log(
            "╔════════════════════════════════════════════════════════════════╗"
        );
        console.log(
            "║  NEW API KEY CREATED - SAVE THIS NOW, IT CANNOT BE RECOVERED!  ║"
        );
        console.log(
            "╠════════════════════════════════════════════════════════════════╣"
        );
        console.log(`║  Key ID:     ${key_id}`);
        console.log(`║  Created:    ${created_at}`);
        if (note) {
            console.log(`║  Note:       ${note}`);
        }
        console.log(
            "╠════════════════════════════════════════════════════════════════╣"
        );
        console.log(`║  API KEY:    ${apiKey}`);
        console.log(
            "╚════════════════════════════════════════════════════════════════╝"
        );
        console.log("\nStore this key securely. It will NOT be shown again.");
    } catch (error) {
        console.error("Failed to create API key:", error);
        process.exit(1);
    }
}

createApiKey().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
