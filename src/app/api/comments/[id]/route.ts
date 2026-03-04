import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashString } from "@/lib/hash";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  try {
    const body = await request.json();
    let { nickname, content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    content = content.trim();
    if (content.length === 0 || content.length > 500) {
      return NextResponse.json(
        { error: "댓글은 1~500자까지 입력 가능합니다." },
        { status: 400 }
      );
    }

    content = content.replace(/<[^>]*>/g, "");

    if (
      !nickname ||
      typeof nickname !== "string" ||
      nickname.trim().length === 0
    ) {
      nickname = "익명";
    } else {
      nickname = nickname.trim().slice(0, 20).replace(/<[^>]*>/g, "");
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashString(ip);

    const recentCheck = await sql`
      SELECT id FROM post_comments
      WHERE ip_hash = ${ipHash}
        AND created_at > NOW() - INTERVAL '30 seconds'
      LIMIT 1
    `;
    if (recentCheck.length > 0) {
      return NextResponse.json(
        { error: "댓글은 30초에 한 번만 작성할 수 있습니다." },
        { status: 429 }
      );
    }

    const result = await sql`
      INSERT INTO post_comments (post_id, nickname, content, ip_hash)
      VALUES (${id}, ${nickname}, ${content}, ${ipHash})
      RETURNING id, post_id, nickname, content, created_at
    `;

    return NextResponse.json({ comment: result[0] }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "댓글 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    const comments = await sql`
      SELECT id, post_id, nickname, content, created_at
      FROM post_comments
      WHERE post_id = ${id}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM post_comments WHERE post_id = ${id}
    `;
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      comments,
      total,
      hasMore: offset + limit < total,
    });
  } catch {
    return NextResponse.json(
      { comments: [], total: 0, hasMore: false },
      { status: 500 }
    );
  }
}
