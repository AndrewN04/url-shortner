/**
 * POST /api/v1/shorten - Create a shortened URL
 *
 * Request:
 *   Authorization: Bearer sk_...
 *   Content-Type: application/json
 *   { "url": "https://example.com", "ttl": 86400 }
 *
 * Response:
 *   { "shortUrl": "https://go.a04.dev/abc123", "code": "abc123", "expiresAt": "2026-01-14T..." }
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { generateShortCode } from "@/lib/crypto";
import { validateUrl } from "@/lib/url-validation";
import {
  authenticateRequest,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  ipRateLimitId,
  keyRateLimitId,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

interface ShortenRequest {
  url: string;
  ttl?: number; // seconds
}

export async function POST(request: NextRequest) {
  const sql = getDb();

  // --- Authentication ---
  const auth = await authenticateRequest(request, sql);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  // --- Rate Limiting ---
  const clientIp = getClientIp(request.headers);

  // Check both IP and key rate limits
  const [ipLimit, keyLimit] = await Promise.all([
    checkRateLimit(sql, ipRateLimitId(clientIp)),
    checkRateLimit(sql, keyRateLimitId(auth.keyId!)),
  ]);

  if (!ipLimit.allowed || !keyLimit.allowed) {
    const resetAt = ipLimit.allowed ? keyLimit.resetAt : ipLimit.resetAt;
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (resetAt.getTime() - Date.now()) / 1000
          ).toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetAt.toISOString(),
        },
      }
    );
  }

  // --- Parse Request Body ---
  let body: ShortenRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (!body.url || typeof body.url !== "string") {
    return errorResponse("Missing required field: url");
  }

  // --- Validate URL ---
  const urlValidation = await validateUrl(body.url);
  if (!urlValidation.valid) {
    return errorResponse(urlValidation.error ?? "Invalid URL");
  }

  const normalizedUrl = urlValidation.normalizedUrl!;

  // --- Validate TTL ---
  let expiresAt: Date | null = null;

  if (body.ttl !== undefined) {
    if (typeof body.ttl !== "number" || !Number.isInteger(body.ttl)) {
      return errorResponse("TTL must be an integer");
    }

    if (body.ttl < config.minTtlSeconds) {
      return errorResponse(
        `TTL must be at least ${config.minTtlSeconds} seconds`
      );
    }

    const maxTtl = config.maxTtlSeconds();
    if (body.ttl > maxTtl) {
      return errorResponse(`TTL must not exceed ${maxTtl} seconds`);
    }

    expiresAt = new Date(Date.now() + body.ttl * 1000);
  } else {
    // Default TTL: 14 days
    expiresAt = new Date(Date.now() + config.maxTtlSeconds() * 1000);
  }

  // --- Generate Short Code ---
  let code: string | null = null;
  let attempts = 0;

  while (!code && attempts < config.maxCodeRetries) {
    const candidate = generateShortCode();
    attempts++;

    // Check for collision
    const existing = await sql`
            SELECT 1 FROM links WHERE code = ${candidate} LIMIT 1
        `;

    if (existing.length === 0) {
      code = candidate;
    }
  }

  if (!code) {
    return errorResponse("Failed to generate unique code", 500);
  }

  // --- Insert Link ---
  await sql`
        INSERT INTO links (code, url, expires_at, created_by_key_id)
        VALUES (${code}, ${normalizedUrl}, ${expiresAt.toISOString()}, ${auth.keyId})
    `;

  // --- Build Response ---
  const host = request.headers.get("host") ?? "go.a04.dev";
  const protocol = config.isDev() ? "http" : "https";
  const shortUrl = `${protocol}://${host}/${code}`;

  return NextResponse.json(
    {
      shortUrl,
      code,
      expiresAt: expiresAt.toISOString(),
    },
    {
      status: 201,
      headers: {
        "X-RateLimit-Remaining": Math.min(
          ipLimit.remaining,
          keyLimit.remaining
        ).toString(),
      },
    }
  );
}
