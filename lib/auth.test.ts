/**
 * Tests for auth utilities
 */

import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import {
    extractBearerToken,
    authenticateRequest,
    errorResponse,
    unauthorizedResponse,
} from "@/lib/auth";

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

    describe("authenticateRequest", () => {
        const createMockSql = (result: unknown[]) => {
            return vi.fn().mockResolvedValue(result) as unknown as ReturnType<
                typeof vi.fn
            >;
        };

        it("should return error for missing Authorization header", async () => {
            const request = new NextRequest("http://localhost/api/test");
            const sql = createMockSql([]);

            const result = await authenticateRequest(request, sql as never);

            expect(result.authenticated).toBe(false);
            expect(result.error).toBe("Missing Authorization header");
        });

        it("should return error for invalid API key format (no sk_ prefix)", async () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "Bearer invalid_key_without_prefix",
                },
            });
            const sql = createMockSql([]);

            const result = await authenticateRequest(request, sql as never);

            expect(result.authenticated).toBe(false);
            expect(result.error).toBe("Invalid API key format");
        });

        it("should return error for API key with wrong length", async () => {
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: "Bearer sk_tooshort",
                },
            });
            const sql = createMockSql([]);

            const result = await authenticateRequest(request, sql as never);

            expect(result.authenticated).toBe(false);
            expect(result.error).toBe("Invalid API key format");
        });

        it("should return error for API key not found in database", async () => {
            // Valid format: sk_ + 64 hex chars = 67 chars total
            const validKey = "sk_" + "a".repeat(64);
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: `Bearer ${validKey}`,
                },
            });
            const sql = createMockSql([]);

            const result = await authenticateRequest(request, sql as never);

            expect(result.authenticated).toBe(false);
            expect(result.error).toBe("Invalid API key");
        });

        it("should return error for revoked API key", async () => {
            const validKey = "sk_" + "a".repeat(64);
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: `Bearer ${validKey}`,
                },
            });
            const sql = createMockSql([
                {
                    key_id: "test-key-id",
                    key_hash: `hashed_${validKey}`,
                    revoked_at: "2026-01-01T00:00:00Z",
                },
            ]);

            const result = await authenticateRequest(request, sql as never);

            expect(result.authenticated).toBe(false);
            expect(result.error).toBe("API key has been revoked");
        });

        it("should authenticate valid API key successfully", async () => {
            const validKey = "sk_" + "a".repeat(64);
            const request = new NextRequest("http://localhost/api/test", {
                headers: {
                    authorization: `Bearer ${validKey}`,
                },
            });
            const sql = createMockSql([
                {
                    key_id: "test-key-id",
                    key_hash: `hashed_${validKey}`,
                    revoked_at: null,
                },
            ]);

            const result = await authenticateRequest(request, sql as never);

            expect(result.authenticated).toBe(true);
            expect(result.keyId).toBe("test-key-id");
            expect(result.error).toBeUndefined();
        });
    });

    describe("errorResponse", () => {
        it("should create JSON error response with default 400 status", async () => {
            const response = errorResponse("Something went wrong");

            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toBe("Something went wrong");
        });

        it("should create JSON error response with custom status", async () => {
            const response = errorResponse("Server error", 500);

            expect(response.status).toBe(500);
            const body = await response.json();
            expect(body.error).toBe("Server error");
        });

        it("should create JSON error response with 404 status", async () => {
            const response = errorResponse("Not found", 404);

            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.error).toBe("Not found");
        });
    });

    describe("unauthorizedResponse", () => {
        it("should create 401 response with default message", async () => {
            const response = unauthorizedResponse();

            expect(response.status).toBe(401);
            const body = await response.json();
            expect(body.error).toBe("Unauthorized");
        });

        it("should create 401 response with custom message", async () => {
            const response = unauthorizedResponse("Invalid credentials");

            expect(response.status).toBe(401);
            const body = await response.json();
            expect(body.error).toBe("Invalid credentials");
        });

        it("should include WWW-Authenticate header", async () => {
            const response = unauthorizedResponse();

            expect(response.headers.get("WWW-Authenticate")).toBe(
                'Bearer realm="api"'
            );
        });
    });
});
