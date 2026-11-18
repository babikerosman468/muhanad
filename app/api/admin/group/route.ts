import { NextResponse } from "next/server";
import { getGroupSql } from "../../../../lib/group-db";
import {
  isAdminAuthenticated,
  isSameOriginRequest
} from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized(request?: Request) {
  if (request && !isSameOriginRequest(request)) return false;
  return await isAdminAuthenticated();
}

export async function GET() {
  try {
    if (!(await authorized())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sql = await getGroupSql();

    const messages = await sql`
      SELECT id, name, message, approved, created_at,
             parent_id, is_announcement
      FROM group_messages
      ORDER BY created_at DESC
      LIMIT 500
    `;

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[admin group GET]", error);
    return NextResponse.json(
      { error: "Unable to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await authorized(request))) {
      return NextResponse.json(
        { error: "Unauthorized or invalid origin" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = String(body.name || "Muhanad Administration").trim();
    const message = String(body.message || "").trim();

    if (!message || message.length > 2000 || name.length > 80) {
      return NextResponse.json(
        { error: "Invalid announcement" },
        { status: 400 }
      );
    }

    const sql = await getGroupSql();

    await sql`
      INSERT INTO group_messages
        (name, message, approved, is_announcement)
      VALUES
        (${name}, ${message}, TRUE, TRUE)
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin group POST]", error);
    return NextResponse.json(
      { error: "Unable to publish announcement" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await authorized(request))) {
      return NextResponse.json(
        { error: "Unauthorized or invalid origin" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);
    const action = body.action;

    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid message ID" },
        { status: 400 }
      );
    }

    const sql = await getGroupSql();

    if (action === "approve") {
      await sql`
        UPDATE group_messages
        SET approved = TRUE
        WHERE id = ${id}
      `;
    } else if (action === "delete") {
      await sql`
        DELETE FROM group_messages
        WHERE id = ${id} OR parent_id = ${id}
      `;
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin group PATCH]", error);
    return NextResponse.json(
      { error: "Unable to moderate message" },
      { status: 500 }
    );
  }
}
