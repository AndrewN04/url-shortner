import { describe, it, expect } from "vitest";
import { migrations } from "@/lib/migrations";

describe("migrations", () => {
    it("should have sequential version numbers starting at 1", () => {
        migrations.forEach((m, index) => {
            expect(m.version).toBe(index + 1);
        });
    });

    it("should have unique version numbers", () => {
        const versions = migrations.map((m) => m.version);
        const uniqueVersions = new Set(versions);
        expect(uniqueVersions.size).toBe(versions.length);
    });

    it("should have unique names", () => {
        const names = migrations.map((m) => m.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
    });

    it("should have non-empty SQL", () => {
        migrations.forEach((m) => {
            expect(m.sql.trim().length).toBeGreaterThan(0);
        });
    });

    describe("initial_schema migration", () => {
        const initial = migrations.find((m) => m.name === "initial_schema");

        it("should exist", () => {
            expect(initial).toBeDefined();
        });

        it("should create api_keys table", () => {
            expect(initial?.sql).toContain("CREATE TABLE IF NOT EXISTS api_keys");
        });

        it("should create links table", () => {
            expect(initial?.sql).toContain("CREATE TABLE IF NOT EXISTS links");
        });

        it("should create schema_migrations table", () => {
            expect(initial?.sql).toContain(
                "CREATE TABLE IF NOT EXISTS schema_migrations"
            );
        });

        it("should create unique index on links.code", () => {
            expect(initial?.sql).toContain(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_links_code ON links(code)"
            );
        });
    });

    describe("rate_limits_table migration", () => {
        const rateLimits = migrations.find((m) => m.name === "rate_limits_table");

        it("should exist", () => {
            expect(rateLimits).toBeDefined();
        });

        it("should create rate_limits table", () => {
            expect(rateLimits?.sql).toContain(
                "CREATE TABLE IF NOT EXISTS rate_limits"
            );
        });
    });
});
