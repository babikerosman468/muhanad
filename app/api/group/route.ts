import { NextResponse } from "next/server";
import { getGroupSql } from "../../../lib/group-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recent = new Map<string, { count: number; start: number }>();

export async function GET() {
  try {
    const sql = await getGroupSql();

    const messages = await sql`
      SELECT id, name, message, created_at,
             parent_id, is_announcement
      FROM group_messages
      WHERE approved = TRUE
      ORDER BY created_at ASC
      LIMIT 300
    `;

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[group GET]", error);
    return NextResponse.json(
      { error: "Unable to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const record = recent.get(ip);

    if (record && now - record.start < 60000) {
      record.count++;

      if (record.count > 8) {
        return NextResponse.json(
          { error: "Too many messages. Try again later." },
          { status: 429 }
        );
      }
    } else {
      recent.set(ip, { count: 1, start: now });
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const message = String(body.message || "").trim();

    const parentId =
      body.parentId === undefined || body.parentId === null
        ? null
        : Number(body.parentId);

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    if (name.length > 80 || message.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long" },
        { status: 400 }
      );
    }

    if (
      parentId !== null &&
      (!Number.isSafeInteger(parentId) || parentId < 1)
    ) {
      return NextResponse.json(
        { error: "Invalid reply target" },
        { status: 400 }
      );
    }

    const sql = await getGroupSql();

    if (parentId !== null) {
      const parent = await sql`
        SELECT id
        FROM group_messages
        WHERE id = ${parentId}
          AND approved = TRUE
          AND parent_id IS NULL
          AND is_announcement = FALSE
        LIMIT 1
      `;

      if (parent.length === 0) {
        return NextResponse.json(
          { error: "Discussion is unavailable" },
          { status: 400 }
        );
      }
    }

    await sql`
      INSERT INTO group_messages
        (name, message, parent_id, approved, is_announcement)
      VALUES
        (${name}, ${message}, ${parentId}, FALSE, FALSE)
    `;

    return NextResponse.json({
      success: true,
      message: "Your contribution is awaiting approval."
    });
  } catch (error) {
    console.error("[group POST]", error);
    return NextResponse.json(
      { error: "Unable to submit message" },
      { status: 500 }
    );
  }
}
