/**
 * Authentication helpers for API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { NeonQueryFunction } from "@neondatabase/serverless";
import { hashApiKey } from "./crypto";

export interface AuthResult {
    authenticated: boolean;
    keyId?: string;
    error?: string;
}

export interface ApiKeyRecord {
    key_id: string;
    key_hash: string;
    revoked_at: string | null;
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") {
        return null;
    }

    return parts[1] ?? null;
}

/**
 * Authenticate a request using Bearer token
 * Returns the key_id if valid, or an error
 */
export async function authenticateRequest(
    request: NextRequest,
    sql: NeonQueryFunction<false, false>
): Promise<AuthResult> {
    const token = extractBearerToken(request);

    if (!token) {
        return {
            authenticated: false,
            error: "Missing Authorization header",
        };
    }

    // Validate token format
    if (!token.startsWith("sk_") || token.length !== 67) {
        return {
            authenticated: false,
            error: "Invalid API key format",
        };
    }

    // Hash the token and look it up
    const tokenHash = hashApiKey(token);

    const result = await sql`
        SELECT key_id, key_hash, revoked_at
        FROM api_keys
        WHERE key_hash = ${tokenHash}
        LIMIT 1
    `;

    if (result.length === 0) {
        return {
            authenticated: false,
            error: "Invalid API key",
        };
    }

    const key = result[0] as ApiKeyRecord;

    // Check if revoked
    if (key.revoked_at) {
        return {
            authenticated: false,
            error: "API key has been revoked",
        };
    }

    return {
        authenticated: true,
        keyId: key.key_id,
    };
}

/**
 * Create a JSON error response
 */
export function errorResponse(
    message: string,
    status: number = 400
): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
    return NextResponse.json(
        { error: message },
        {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Bearer realm="api"',
            },
        }
    );
}
