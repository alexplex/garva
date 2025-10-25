import { NextResponse } from "next/server";
import { getAllJokes } from "@/lib/jokes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jokes = await getAllJokes();
    return NextResponse.json({ jokes });
  } catch (error) {
    console.error("[api/jokes]", error);
    return NextResponse.json(
      { error: "Unable to load jokes right now." },
      { status: 500 }
    );
  }
}
