import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const sql = getSql();

    const comments = await sql`
      SELECT
        id,
        post_slug,
        name,
        comment,
        created_at,
        approved,
        parent_id
      FROM comments
      ORDER BY created_at DESC
      LIMIT 200
    `;

    const pending = comments.filter(
      (item) => item.approved === false
    ).length;

    const approved = comments.filter(
      (item) => item.approved === true
    ).length;

    const response = NextResponse.json({
      comments,
      statistics: {
        total: comments.length,
        pending,
        approved,
      },
    });

    response.headers.set("Cache-Control", "no-store");

    return response;

  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve comments" },
      { status: 500 }
    );
  }
}
