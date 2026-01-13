/**
 * Tests for URL validation and SSRF protection
 */

import { describe, it, expect } from "vitest";
import {
    isPrivateIp,
    isBlockedHostname,
    validateUrlFormat,
} from "@/lib/url-validation";

describe("URL validation", () => {
    describe("isPrivateIp", () => {
        it("should detect loopback addresses", () => {
            expect(isPrivateIp("127.0.0.1")).toBe(true);
            expect(isPrivateIp("127.0.0.2")).toBe(true);
            expect(isPrivateIp("127.255.255.255")).toBe(true);
        });

        it("should detect Class A private addresses (10.x.x.x)", () => {
            expect(isPrivateIp("10.0.0.1")).toBe(true);
            expect(isPrivateIp("10.255.255.255")).toBe(true);
        });

        it("should detect Class B private addresses (172.16-31.x.x)", () => {
            expect(isPrivateIp("172.16.0.1")).toBe(true);
            expect(isPrivateIp("172.31.255.255")).toBe(true);
            expect(isPrivateIp("172.15.0.1")).toBe(false);
            expect(isPrivateIp("172.32.0.1")).toBe(false);
        });

        it("should detect Class C private addresses (192.168.x.x)", () => {
            expect(isPrivateIp("192.168.0.1")).toBe(true);
            expect(isPrivateIp("192.168.255.255")).toBe(true);
        });

        it("should detect link-local addresses", () => {
            expect(isPrivateIp("169.254.0.1")).toBe(true);
        });

        it("should allow public IP addresses", () => {
            expect(isPrivateIp("8.8.8.8")).toBe(false);
            expect(isPrivateIp("1.1.1.1")).toBe(false);
            expect(isPrivateIp("142.250.80.46")).toBe(false);
        });

        it("should detect IPv6 loopback", () => {
            expect(isPrivateIp("::1")).toBe(true);
        });

        it("should detect IPv6 link-local", () => {
            expect(isPrivateIp("fe80::1")).toBe(true);
            expect(isPrivateIp("FE80::1")).toBe(true);
        });

        it("should detect IPv6 unique local", () => {
            expect(isPrivateIp("fc00::1")).toBe(true);
            expect(isPrivateIp("fd00::1")).toBe(true);
        });
    });

    describe("isBlockedHostname", () => {
        it("should block localhost variations", () => {
            expect(isBlockedHostname("localhost")).toBe(true);
            expect(isBlockedHostname("LOCALHOST")).toBe(true);
            expect(isBlockedHostname("localhost.localdomain")).toBe(true);
        });

        it("should allow normal hostnames", () => {
            expect(isBlockedHostname("example.com")).toBe(false);
            expect(isBlockedHostname("google.com")).toBe(false);
        });
    });

    describe("validateUrlFormat", () => {
        it("should accept valid http URLs", () => {
            const result = validateUrlFormat("http://example.com");
            expect(result.valid).toBe(true);
            expect(result.normalizedUrl).toBe("http://example.com/");
        });

        it("should accept valid https URLs", () => {
            const result = validateUrlFormat("https://example.com/path?query=1");
            expect(result.valid).toBe(true);
        });

        it("should reject non-http schemes", () => {
            expect(validateUrlFormat("ftp://example.com").valid).toBe(false);
            expect(validateUrlFormat("file:///etc/passwd").valid).toBe(false);
            expect(validateUrlFormat("javascript:alert(1)").valid).toBe(false);
            expect(validateUrlFormat("data:text/html,<script>").valid).toBe(false);
        });

        it("should reject invalid URLs", () => {
            expect(validateUrlFormat("not a url").valid).toBe(false);
            expect(validateUrlFormat("").valid).toBe(false);
        });

        it("should reject localhost", () => {
            expect(validateUrlFormat("http://localhost").valid).toBe(false);
            expect(validateUrlFormat("http://localhost:3000").valid).toBe(false);
        });

        it("should reject private IP addresses", () => {
            expect(validateUrlFormat("http://127.0.0.1").valid).toBe(false);
            expect(validateUrlFormat("http://10.0.0.1").valid).toBe(false);
            expect(validateUrlFormat("http://192.168.1.1").valid).toBe(false);
            expect(validateUrlFormat("http://172.16.0.1").valid).toBe(false);
        });

        it("should allow public IP addresses", () => {
            expect(validateUrlFormat("http://8.8.8.8").valid).toBe(true);
        });

        it("should reject URLs that are too long", () => {
            const longUrl = "https://example.com/" + "a".repeat(2100);
            const result = validateUrlFormat(longUrl);
            expect(result.valid).toBe(false);
            expect(result.error).toContain("maximum length");
        });

        it("should normalize URLs", () => {
            const result = validateUrlFormat("HTTP://EXAMPLE.COM");
            expect(result.valid).toBe(true);
            expect(result.normalizedUrl).toBe("http://example.com/");
        });
    });
});
