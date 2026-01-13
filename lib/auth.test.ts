/**
 * Tests for auth utilities
 */

import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { extractBearerToken } from "@/lib/auth";

// Mock crypto module
vi.mock("@/lib/crypto", () => ({
    hashApiKey: vi.fn((key: string) => `hashed_${key}`),
}));

describe("auth utilities", () => {
    describe("extractBearerToken", () => {
        it("should extract token from valid Bearer header", () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "Bearer sk_abc123",
                },
            });
            expect(extractBearerToken(request)).toBe("sk_abc123");
        });

        it("should handle case-insensitive Bearer", () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "bearer sk_abc123",
                },
            });
            expect(extractBearerToken(request)).toBe("sk_abc123");
        });

        it("should return null for missing header", () => {
            const request = new NextRequest("http://localhost/api/test");
            expect(extractBearerToken(request)).toBeNull();
        });

        it("should return null for non-Bearer auth", () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "Basic dXNlcjpwYXNz",
                },
            });
            expect(extractBearerToken(request)).toBeNull();
        });

        it("should return null for malformed header", () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "Bearer",
                },
            });
            expect(extractBearerToken(request)).toBeNull();
        });

        it("should return null for empty Bearer token", () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "Bearer ",
                },
            });
            // Splits to ["Bearer", ""] - second part is empty string which is falsy
            expect(extractBearerToken(request)).toBeNull();
        });
    });
});
