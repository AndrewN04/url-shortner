/**
 * GET /:code - Redirect to the original URL
 *
 * Returns:
 *   302 redirect if link is valid
 *   404 if link not found
 *   410 if link expired or revoked
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

interface LinkRecord {
    id: string;
    url: string;
    expires_at: string | null;
    revoked_at: string | null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;

    // Validate code format (alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(code)) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const sql = getDb();

    // Look up the link
    const result = await sql`
        SELECT id, url, expires_at, revoked_at
        FROM links
        WHERE code = ${code}
        LIMIT 1
    `;

    if (result.length === 0) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const link = result[0] as LinkRecord;

    // Check if revoked
    if (link.revoked_at) {
        return new NextResponse("Gone", { status: 410 });
    }

    // Check if expired
    if (link.expires_at) {
        const expiresAt = new Date(link.expires_at);
        if (expiresAt < new Date()) {
            return new NextResponse("Gone", { status: 410 });
        }
    }

    // Redirect to the original URL
    return NextResponse.redirect(link.url, {
        status: 302,
        headers: {
            "Cache-Control": "private, max-age=0, no-cache",
            "X-Robots-Tag": "noindex",
        },
    });
}
