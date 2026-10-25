import { NextResponse } from "next/server";
import { getSql } from "../../../lib/db";

const recent = new Map<string, number>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

export async function GET(request: Request) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get("post");
    if (!postSlug) {
      return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
    }

    const comments = await sql`
      SELECT id, name, comment, created_at, parent_id
      FROM comments
      WHERE post_slug = ${postSlug} AND approved = true
      ORDER BY created_at DESC
    `;
    return NextResponse.json(comments);
  } catch (err) {
    console.error("[comments GET]", err);
    return NextResponse.json({ error: "Unable to load comments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getSql();
    // --- rate limit ---
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const hits = (recent.get(ip) ?? 0) + 1;
    recent.set(ip, hits);
    setTimeout(() => recent.delete(ip), WINDOW_MS);
    if (hits > MAX_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many comments. Try again later." },
        { status: 429 }
      );
    }

    // --- parse & validate ---
    const body = await request.json();
    const name = String(body.name || "").trim();
    const comment = String(body.comment || "").trim();
    const postSlug = String(body.postSlug || "").trim();

    const rawParent = body.parentId;
    const parentId =
      rawParent === undefined || rawParent === null || rawParent === ""
        ? null
        : Number.isInteger(Number(rawParent))
          ? Number(rawParent)
          : null;

    if (!name || !comment || !postSlug) {
      return NextResponse.json(
        { error: "Name, comment and post are required" },
        { status: 400 }
      );
    }
    if (name.length > 80 || comment.length > 2000) {
      return NextResponse.json({ error: "Comment is too long" }, { status: 400 });
    }

    // --- spam heuristics ---
    const linkCount = (comment.match(/https?:\/\//gi) ?? []).length;
    if (linkCount > 2) {
      return NextResponse.json({ error: "Too many links" }, { status: 400 });
    }

    // --- insert (moderation OFF by default here; change to `false` to enable) ---
    await sql`
      INSERT INTO comments (post_slug, name, comment, parent_id, approved)
      VALUES (${postSlug}, ${name}, ${comment}, ${parentId}, true)
    `;

    return NextResponse.json({ success: true, message: "Comment posted." });
  } catch (err) {
    console.error("[comments POST]", err);
    return NextResponse.json({ error: "Unable to submit comment" }, { status: 500 });
  }
}
