/**
 * URL validation with SSRF protection
 * Validates URLs and blocks private/internal IP addresses
 */

import { promises as dns } from "dns";
import { config } from "./config";

// Private IP ranges (RFC 1918, RFC 4193, etc.)
const PRIVATE_IP_PATTERNS = [
    /^127\./, // Loopback
    /^10\./, // Class A private
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // Class B private
    /^192\.168\./, // Class C private
    /^169\.254\./, // Link-local
    /^0\./, // "This" network
    /^224\./, // Multicast
    /^240\./, // Reserved
    /^255\./, // Broadcast
    /^::1$/, // IPv6 loopback
    /^fe80:/i, // IPv6 link-local
    /^fc00:/i, // IPv6 unique local
    /^fd00:/i, // IPv6 unique local
];

// Blocked hostnames
const BLOCKED_HOSTNAMES = [
    "localhost",
    "localhost.localdomain",
    "ip6-localhost",
    "ip6-loopback",
];

export interface UrlValidationResult {
    valid: boolean;
    error?: string;
    normalizedUrl?: string;
}

/**
 * Check if an IP address is private/internal
 */
export function isPrivateIp(ip: string): boolean {
    return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

/**
 * Check if a hostname is blocked
 */
export function isBlockedHostname(hostname: string): boolean {
    const lower = hostname.toLowerCase();
    return BLOCKED_HOSTNAMES.includes(lower);
}

/**
 * Validate URL format and scheme
 */
export function validateUrlFormat(urlString: string): UrlValidationResult {
    // Check length
    if (urlString.length > config.maxUrlLength) {
        return {
            valid: false,
            error: `URL exceeds maximum length of ${config.maxUrlLength} characters`,
        };
    }

    // Try to parse URL
    let url: URL;
    try {
        url = new URL(urlString);
    } catch {
        return { valid: false, error: "Invalid URL format" };
    }

    // Check scheme (only http/https allowed)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return {
            valid: false,
            error: "Only http and https URLs are allowed",
        };
    }

    // Check for empty hostname
    if (!url.hostname) {
        return { valid: false, error: "URL must have a hostname" };
    }

    // Block internal hostnames
    if (isBlockedHostname(url.hostname)) {
        return { valid: false, error: "Localhost URLs are not allowed" };
    }

    // Check if hostname is an IP address
    const ipv4Match = url.hostname.match(
        /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    );
    if (ipv4Match) {
        if (isPrivateIp(url.hostname)) {
            return { valid: false, error: "Private IP addresses are not allowed" };
        }
    }

    // Check for IPv6 in brackets
    if (url.hostname.startsWith("[") && url.hostname.endsWith("]")) {
        const ipv6 = url.hostname.slice(1, -1);
        if (isPrivateIp(ipv6)) {
            return { valid: false, error: "Private IP addresses are not allowed" };
        }
    }

    return { valid: true, normalizedUrl: url.toString() };
}

/**
 * Resolve hostname and check for SSRF (DNS rebinding protection)
 */
export async function validateUrlDns(urlString: string): Promise<UrlValidationResult> {
    // First validate format
    const formatResult = validateUrlFormat(urlString);
    if (!formatResult.valid) {
        return formatResult;
    }

    const url = new URL(urlString);

    // Skip DNS check for direct IP addresses (already validated above)
    const isDirectIp =
        /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) ||
        (url.hostname.startsWith("[") && url.hostname.endsWith("]"));

    if (isDirectIp) {
        return formatResult;
    }

    // Resolve hostname to check for private IPs
    try {
        const addresses = await dns.resolve4(url.hostname);

        for (const ip of addresses) {
            if (isPrivateIp(ip)) {
                return {
                    valid: false,
                    error: "URL resolves to a private IP address",
                };
            }
        }
    } catch {
        // If DNS resolution fails, try IPv6
        try {
            const addresses = await dns.resolve6(url.hostname);

            for (const ip of addresses) {
                if (isPrivateIp(ip)) {
                    return {
                        valid: false,
                        error: "URL resolves to a private IP address",
                    };
                }
            }
        } catch {
            // If both fail, the domain might not exist
            return { valid: false, error: "Unable to resolve hostname" };
        }
    }

    return formatResult;
}

/**
 * Full URL validation (format + DNS)
 * Use this for the shorten endpoint
 */
export async function validateUrl(urlString: string): Promise<UrlValidationResult> {
    return validateUrlDns(urlString);
}
