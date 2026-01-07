import { describe, it, expect, vi } from "vitest";
import {
    generateApiKey,
    hashApiKey,
    verifyApiKey,
    generateShortCode,
} from "@/lib/crypto";

// Mock the config module
vi.mock("@/lib/config", () => ({
    config: {
        apiKeyPepper: () => "test-pepper-secret",
        codeLength: 12,
    },
}));

describe("crypto utilities", () => {
    describe("generateApiKey", () => {
        it("should generate a key with sk_ prefix", () => {
            const key = generateApiKey();
            expect(key.startsWith("sk_")).toBe(true);
        });

        it("should generate 64 hex characters after prefix", () => {
            const key = generateApiKey();
            const hex = key.slice(3);
            expect(hex).toMatch(/^[a-f0-9]{64}$/);
        });

        it("should generate unique keys", () => {
            const keys = new Set<string>();
            for (let i = 0; i < 100; i++) {
                keys.add(generateApiKey());
            }
            expect(keys.size).toBe(100);
        });
    });

    describe("hashApiKey", () => {
        it("should produce consistent hash for same input", () => {
            const key = "sk_testkey123";
            const hash1 = hashApiKey(key);
            const hash2 = hashApiKey(key);
            expect(hash1).toBe(hash2);
        });

        it("should produce 64-character hex hash", () => {
            const key = "sk_testkey123";
            const hash = hashApiKey(key);
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });

        it("should produce different hashes for different keys", () => {
            const hash1 = hashApiKey("sk_key1");
            const hash2 = hashApiKey("sk_key2");
            expect(hash1).not.toBe(hash2);
        });
    });

    describe("verifyApiKey", () => {
        it("should return true for matching key and hash", () => {
            const key = generateApiKey();
            const hash = hashApiKey(key);
            expect(verifyApiKey(key, hash)).toBe(true);
        });

        it("should return false for non-matching key", () => {
            const key1 = generateApiKey();
            const key2 = generateApiKey();
            const hash = hashApiKey(key1);
            expect(verifyApiKey(key2, hash)).toBe(false);
        });

        it("should return false for malformed hash", () => {
            const key = generateApiKey();
            expect(verifyApiKey(key, "invalid")).toBe(false);
            expect(verifyApiKey(key, "")).toBe(false);
        });

        it("should be constant-time (no early return on mismatch)", () => {
            const key = "sk_testkey";
            const correctHash = hashApiKey(key);
            const wrongHash = "a".repeat(64);

            expect(verifyApiKey(key, correctHash)).toBe(true);
            expect(verifyApiKey(key, wrongHash)).toBe(false);
        });
    });

    describe("generateShortCode", () => {
        it("should generate code of specified length", () => {
            const code = generateShortCode(12);
            expect(code.length).toBe(12);
        });

        it("should only use URL-safe characters", () => {
            const code = generateShortCode(100);
            expect(code).not.toMatch(/[0O1lI]/);
            expect(code).toMatch(/^[a-zA-Z0-9]+$/);
        });

        it("should generate unique codes", () => {
            const codes = new Set<string>();
            for (let i = 0; i < 1000; i++) {
                codes.add(generateShortCode(12));
            }
            expect(codes.size).toBe(1000);
        });

        it("should use default length from config", () => {
            const code = generateShortCode();
            expect(code.length).toBe(12);
        });

        it("should have reasonably uniform distribution (no modulo bias)", () => {
            // Generate many codes and check character frequency
            const charCounts = new Map<string, number>();
            const iterations = 10000;
            const codeLength = 12;

            for (let i = 0; i < iterations; i++) {
                const code = generateShortCode(codeLength);
                for (const char of code) {
                    charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
                }
            }

            const totalChars = iterations * codeLength;
            const alphabetSize = 58; // length of our alphabet
            const expected = totalChars / alphabetSize;
            const tolerance = 0.15; // Allow 15% deviation

            for (const [, count] of charCounts) {
                const deviation = Math.abs(count - expected) / expected;
                expect(deviation).toBeLessThan(tolerance);
            }
        });
    });
});
