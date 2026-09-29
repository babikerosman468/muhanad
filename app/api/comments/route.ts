import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postSlug = searchParams.get("post");
  if (!postSlug) return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
  const comments = await sql`SELECT id, name, comment, created_at, parent_id FROM comments WHERE post_slug = ${postSlug} AND approved = true ORDER BY created_at DESC`;
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const comment = String(body.comment || "").trim();
    
const postSlug = String(body.postSlug || "").trim();
const parentId = body.parentId ? Number(body.parentId) : null;

    if (!name || !comment || !postSlug) return NextResponse.json({ error: "Name, comment and post are required" }, { status: 400 });
    if (name.length > 80 || comment.length > 2000) return NextResponse.json({ error: "Comment is too long" }, { status: 400 });
await sql`INSERT INTO comments (post_slug, name, comment, parent_id, approved)
VALUES (${postSlug}, ${name}, ${comment}, ${parentId}, true)`;

    return NextResponse.json({ success: true, message: "Comment posted."});
  } catch {
    return NextResponse.json({ error: "Unable to submit comment" }, { status: 500 });
  }
}
