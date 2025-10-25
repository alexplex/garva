import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/login]", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
