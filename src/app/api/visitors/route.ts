import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  const sql = getDb();

  try {
    const result = await sql`
      INSERT INTO daily_visitors (visit_date, visitor_count)
      VALUES (CURRENT_DATE, 1)
      ON CONFLICT (visit_date)
      DO UPDATE SET visitor_count = daily_visitors.visitor_count + 1
      RETURNING visitor_count
    `;
    return NextResponse.json({ today: result[0].visitor_count });
  } catch {
    return NextResponse.json({ today: 0 }, { status: 500 });
  }
}

export async function GET() {
  const sql = getDb();

  try {
    const result = await sql`
      SELECT
        (SELECT visitor_count FROM daily_visitors WHERE visit_date = CURRENT_DATE) as today,
        (SELECT COALESCE(SUM(visitor_count), 0) FROM daily_visitors) as total
    `;
    return NextResponse.json({
      today: result[0].today || 0,
      total: result[0].total || 0,
    });
  } catch {
    return NextResponse.json({ today: 0, total: 0 }, { status: 500 });
  }
}
