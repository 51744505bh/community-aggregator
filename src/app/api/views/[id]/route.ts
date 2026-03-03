import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  try {
    const result = await sql`
      INSERT INTO post_views (post_id, view_count)
      VALUES (${id}, 1)
      ON CONFLICT (post_id)
      DO UPDATE SET view_count = post_views.view_count + 1
      RETURNING view_count
    `;
    return NextResponse.json({ views: result[0].view_count });
  } catch {
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  try {
    const result = await sql`
      SELECT view_count FROM post_views WHERE post_id = ${id}
    `;
    return NextResponse.json({ views: result[0]?.view_count || 0 });
  } catch {
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
