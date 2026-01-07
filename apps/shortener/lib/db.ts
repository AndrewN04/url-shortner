import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { config } from "./config";

// Cache the database connection
let sql: NeonQueryFunction<false, false> | null = null;

/**
 * Get database connection (cached for reuse within same request/invocation)
 * Uses Neon's HTTP-based driver which is ideal for serverless
 */
export function getDb(): NeonQueryFunction<false, false> {
    if (!sql) {
        sql = neon(config.databaseUrl());
    }
    return sql;
}

/**
 * Create a fresh database connection (for migrations/scripts)
 */
export function createDb(
    connectionString?: string
): NeonQueryFunction<false, false> {
    return neon(connectionString ?? config.databaseUrl());
}
