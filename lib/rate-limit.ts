/**
 * Rate limiting using database-backed storage
 * Works with Vercel serverless (no in-memory state across invocations)
 */

import { NeonQueryFunction } from "@neondatabase/serverless";
import { config } from "./config";

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

/**
 * Check and update rate limit for an identifier
 * Returns whether the request is allowed
 */
export async function checkRateLimit(
    sql: NeonQueryFunction<false, false>,
    identifier: string
): Promise<RateLimitResult> {
    const windowMs = config.rateLimitWindowMs;
    const maxRequests = config.rateLimitMaxRequests;

    // Calculate current window start (floor to window boundary)
    const now = Date.now();
    const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
    const resetAt = new Date(windowStart.getTime() + windowMs);

    // Try to increment or insert rate limit record
    // Using UPSERT pattern with ON CONFLICT
    const result = await sql`
        INSERT INTO rate_limits (id, window_start, request_count)
        VALUES (${identifier}, ${windowStart.toISOString()}, 1)
        ON CONFLICT (id) DO UPDATE SET
            request_count = CASE
                WHEN rate_limits.window_start = ${windowStart.toISOString()}
                THEN rate_limits.request_count + 1
                ELSE 1
            END,
            window_start = ${windowStart.toISOString()}
        RETURNING request_count
    `;

    const count = result[0]?.request_count as number;
    const remaining = Math.max(0, maxRequests - count);
    const allowed = count <= maxRequests;

    return { allowed, remaining, resetAt };
}

/**
 * Create rate limit identifier for IP
 */
export function ipRateLimitId(ip: string): string {
    return `ip:${ip}`;
}

/**
 * Create rate limit identifier for API key
 */
export function keyRateLimitId(keyId: string): string {
    return `key:${keyId}`;
}

/**
 * Get client IP from request headers
 * Handles Vercel's forwarding headers
 */
export function getClientIp(headers: Headers): string {
    // Vercel sets this header
    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) {
        // Take the first IP (client IP)
        const firstIp = forwardedFor.split(",")[0]?.trim();
        if (firstIp) return firstIp;
    }

    // Fallback headers
    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp;

    // Default fallback
    return "unknown";
}
