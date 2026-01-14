/**
 * Tests for rate limiting utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    ipRateLimitId,
    keyRateLimitId,
    getClientIp,
    checkRateLimit,
} from "@/lib/rate-limit";

describe("rate-limit utilities", () => {
    describe("ipRateLimitId", () => {
        it("should create IP-based identifier", () => {
            expect(ipRateLimitId("192.168.1.1")).toBe("ip:192.168.1.1");
            expect(ipRateLimitId("8.8.8.8")).toBe("ip:8.8.8.8");
        });
    });

    describe("keyRateLimitId", () => {
        it("should create key-based identifier", () => {
            expect(keyRateLimitId("abc123")).toBe("key:abc123");
        });
    });

    describe("getClientIp", () => {
        it("should extract IP from x-forwarded-for header", () => {
            const headers = new Headers({
                "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
            });
            expect(getClientIp(headers)).toBe("203.0.113.195");
        });

        it("should handle single IP in x-forwarded-for", () => {
            const headers = new Headers({
                "x-forwarded-for": "203.0.113.195",
            });
            expect(getClientIp(headers)).toBe("203.0.113.195");
        });

        it("should fallback to x-real-ip", () => {
            const headers = new Headers({
                "x-real-ip": "203.0.113.195",
            });
            expect(getClientIp(headers)).toBe("203.0.113.195");
        });

        it("should return unknown when no IP headers present", () => {
            const headers = new Headers({});
            expect(getClientIp(headers)).toBe("unknown");
        });

        it("should prefer x-forwarded-for over x-real-ip", () => {
            const headers = new Headers({
                "x-forwarded-for": "1.1.1.1",
                "x-real-ip": "2.2.2.2",
            });
            expect(getClientIp(headers)).toBe("1.1.1.1");
        });
    });

    describe("checkRateLimit", () => {
        // The checkRateLimit function uses config.rateLimitMaxRequests (10)
        // and config.rateLimitWindowMs (60000) internally.
        // maxRequests = 10 by default

        const createMockSql = (rows: unknown[]) => {
            const mockFn = vi.fn().mockResolvedValue(rows);
            return mockFn as unknown as ReturnType<typeof vi.fn>;
        };

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should allow request when under rate limit", async () => {
            // Config default: maxRequests = 10
            const sql = createMockSql([{ request_count: 5 }]);

            const result = await checkRateLimit(sql as never, "ip:192.168.1.1");

            expect(result.allowed).toBe(true);
            // remaining = max(0, 10 - 5) = 5
            expect(result.remaining).toBe(5);
        });

        it("should allow request when at rate limit boundary", async () => {
            // count = 10, maxRequests = 10, count <= maxRequests is true
            const sql = createMockSql([{ request_count: 10 }]);

            const result = await checkRateLimit(sql as never, "ip:192.168.1.1");

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(0);
        });

        it("should block request when over rate limit", async () => {
            // count = 11, maxRequests = 10, count <= maxRequests is false
            const sql = createMockSql([{ request_count: 11 }]);

            const result = await checkRateLimit(sql as never, "ip:192.168.1.1");

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it("should return resetAt as a Date object", async () => {
            const sql = createMockSql([{ request_count: 5 }]);

            const result = await checkRateLimit(sql as never, "ip:192.168.1.1");

            expect(result.resetAt).toBeInstanceOf(Date);
            // Reset should be in the future
            expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
        });

        it("should handle first request scenario", async () => {
            // First request: count = 1
            const sql = createMockSql([{ request_count: 1 }]);

            const result = await checkRateLimit(sql as never, "ip:new-client");

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(9);
        });

        it("should work with API key identifiers", async () => {
            // count = 3, maxRequests = 10
            const sql = createMockSql([{ request_count: 3 }]);

            const result = await checkRateLimit(sql as never, "key:test-api-key");

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(7);
        });
    });
});
