import { describe, it, expect, vi, beforeEach } from "vitest";
import { config } from "@/lib/config";

describe("config", () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    describe("databaseUrl", () => {
        it("should return DATABASE_URL when set", () => {
            vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
            expect(config.databaseUrl()).toBe("postgresql://test:test@localhost/test");
        });

        it("should throw when DATABASE_URL is not set", () => {
            vi.stubEnv("DATABASE_URL", "");
            expect(() => config.databaseUrl()).toThrow(
                "Missing required environment variable: DATABASE_URL"
            );
        });
    });

    describe("apiKeyPepper", () => {
        it("should return API_KEY_PEPPER when set", () => {
            vi.stubEnv("API_KEY_PEPPER", "secret-pepper");
            expect(config.apiKeyPepper()).toBe("secret-pepper");
        });

        it("should throw when API_KEY_PEPPER is not set", () => {
            vi.stubEnv("API_KEY_PEPPER", "");
            expect(() => config.apiKeyPepper()).toThrow(
                "Missing required environment variable: API_KEY_PEPPER"
            );
        });
    });

    describe("maxTtlSeconds", () => {
        it("should return default value when not set", () => {
            vi.stubEnv("MAX_TTL_SECONDS", "");
            expect(config.maxTtlSeconds()).toBe(14 * 24 * 60 * 60);
        });

        it("should parse custom value", () => {
            vi.stubEnv("MAX_TTL_SECONDS", "3600");
            expect(config.maxTtlSeconds()).toBe(3600);
        });
    });

    describe("static config values", () => {
        it("should have correct min TTL", () => {
            expect(config.minTtlSeconds).toBe(60);
        });

        it("should have correct code length", () => {
            expect(config.codeLength).toBe(12);
        });

        it("should have correct rate limit settings", () => {
            expect(config.rateLimitWindowMs).toBe(60 * 1000);
            expect(config.rateLimitMaxRequests).toBe(10);
        });

        it("should have correct URL length limit", () => {
            expect(config.maxUrlLength).toBe(2048);
        });
    });
});
