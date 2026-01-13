/**
 * Tests for rate limiting utilities
 */

import { describe, it, expect } from "vitest";
import { ipRateLimitId, keyRateLimitId, getClientIp } from "@/lib/rate-limit";

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
});
