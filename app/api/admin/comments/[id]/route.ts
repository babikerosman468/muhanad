import { NextResponse } from "next/server";
import { getSql } from "../../../../../lib/db";
import {
  isAdminAuthenticated,
  isSameOriginRequest,
} from "../../../../../lib/admin-auth";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

async function authorize(request: Request) {
  if (!isSameOriginRequest(request)) {
    return false;
  }

  return isAdminAuthenticated();
}

export async function PATCH(
  request: Request,
  context: Context
) {
  if (!(await authorize(request))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const commentId = Number(id);

    if (!Number.isSafeInteger(commentId) || commentId < 1) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    const sql = getSql();

    const result = await sql`
      UPDATE comments
      SET approved = true
      WHERE id = ${commentId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Approval failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  if (!(await authorize(request))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const commentId = Number(id);

    if (!Number.isSafeInteger(commentId) || commentId < 1) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    const sql = getSql();

    const result = await sql`
      DELETE FROM comments
      WHERE id = ${commentId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Rejection failed" },
      { status: 500 }
    );
  }
}
