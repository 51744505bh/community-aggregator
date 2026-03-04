import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashString } from "@/lib/hash";

async function getFingerprint(request: NextRequest): Promise<string> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  return hashString(`${ip}::${ua}`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  try {
    const fingerprint = await getFingerprint(request);

    const existing = await sql`
      SELECT fingerprint FROM post_likes
      WHERE post_id = ${id} AND fingerprint = ${fingerprint}
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM post_likes
        WHERE post_id = ${id} AND fingerprint = ${fingerprint}
      `;
    } else {
      await sql`
        INSERT INTO post_likes (post_id, fingerprint)
        VALUES (${id}, ${fingerprint})
      `;
    }

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = ${id}
    `;

    return NextResponse.json({
      count: countResult[0]?.count || 0,
      liked: existing.length === 0,
    });
  } catch {
    return NextResponse.json({ count: 0, liked: false }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  try {
    const fingerprint = await getFingerprint(request);

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = ${id}
    `;

    const likedResult = await sql`
      SELECT fingerprint FROM post_likes
      WHERE post_id = ${id} AND fingerprint = ${fingerprint}
    `;

    return NextResponse.json({
      count: countResult[0]?.count || 0,
      liked: likedResult.length > 0,
    });
  } catch {
    return NextResponse.json({ count: 0, liked: false }, { status: 500 });
  }
}
