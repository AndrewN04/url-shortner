import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
    try {
        const sql = getDb();
        const result = await sql`SELECT 1 as ok`;

        if (result[0]?.ok === 1) {
            return NextResponse.json({ status: "healthy" }, { status: 200 });
        }

        return NextResponse.json({ status: "unhealthy" }, { status: 503 });
    } catch {
        return NextResponse.json({ status: "unhealthy" }, { status: 503 });
    }
}
