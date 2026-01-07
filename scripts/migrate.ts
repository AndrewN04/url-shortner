/**
 * Database Migration Script
 * Run with: npm run db:migrate
 */

import { config as dotenvConfig } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { migrations } from "../lib/migrations";

// Load .env for local development
dotenvConfig();

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
            // Execute migration SQL statements
            const statements = migration.sql
                .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && !s.startsWith("--"));

            for (const statement of statements) {
                await sql([statement] as unknown as TemplateStringsArray);
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
