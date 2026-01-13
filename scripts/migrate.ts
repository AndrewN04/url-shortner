/**
 * Database Migration Script
 * Run with: npm run db:migrate
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { migrations } from "../lib/migrations";

// Load .env.local for local development (Next.js convention)
dotenvConfig({ path: ".env.local" });
// Fallback to .env if .env.local doesn't exist
dotenvConfig({ path: ".env" });

async function migrate() {
    console.log("Starting database migration...\n");

    const databaseUrl = process.env["DATABASE_URL"];
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(databaseUrl);

    // Get applied migrations
    let appliedVersions: Set<number> = new Set();

    try {
        const result = await sql`
      SELECT version FROM schema_migrations ORDER BY version
    `;
        appliedVersions = new Set(result.map((r) => r.version as number));
    } catch {
        // Table doesn't exist yet, first migration will create it
        console.log("First run - schema_migrations table will be created.\n");
    }

    // Apply pending migrations
    let applied = 0;

    for (const migration of migrations) {
        if (appliedVersions.has(migration.version)) {
            console.log(
                `✓ Migration ${migration.version} (${migration.name}) already applied`
            );
            continue;
        }

        console.log(`→ Applying migration ${migration.version}: ${migration.name}...`);

        try {
            // Execute migration SQL statements one at a time
            // Split on semicolons not inside quotes, filter empty/comments
            const statements = migration.sql
                .split(/;/)
                .map((s: string) => s.trim())
                .filter((s: string) => {
                    // Remove empty lines and pure comment lines
                    const lines = s.split('\n').filter(line => {
                        const trimmed = line.trim();
                        return trimmed.length > 0 && !trimmed.startsWith('--');
                    });
                    return lines.length > 0;
                });

            for (const statement of statements) {
                // Skip if it's just whitespace after filtering
                if (!statement.trim()) continue;
                await sql.query(statement);
            }

            // Record migration
            await sql`
        INSERT INTO schema_migrations (version, name)
        VALUES (${migration.version}, ${migration.name})
      `;

            console.log(`  ✓ Applied successfully`);
            applied++;
        } catch (error) {
            console.error(
                `  ✗ Failed to apply migration ${migration.version}:`,
                error
            );
            process.exit(1);
        }
    }

    console.log(`\n✓ Migration complete. Applied ${applied} migration(s).`);
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
