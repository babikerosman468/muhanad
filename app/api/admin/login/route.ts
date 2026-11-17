import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionToken,
  isSameOriginRequest,
  verifyAdminPassword,
} from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    if (!verifyAdminPassword(body.password)) {
      return NextResponse.json(
        { error: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      redirect: "/admin/comments",
    });

    response.cookies.set(
      ADMIN_COOKIE_NAME,
      createAdminSessionToken(),
      adminCookieOptions
    );

    response.headers.set("Cache-Control", "no-store");

    return response;

  } catch {
    return NextResponse.json(
      { error: "Login service is not configured correctly" },
      { status: 500 }
    );
  }
}
