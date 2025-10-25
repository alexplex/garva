import { NextResponse } from "next/server";
import { getAllJokes } from "@/lib/jokes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[api/jokes] Fetching jokes...");
    const jokes = await getAllJokes();
    console.log(`[api/jokes] Successfully fetched ${jokes.length} jokes`);
    return NextResponse.json({ jokes });
  } catch (error) {
    console.error("[api/jokes] Error:", error);
    return NextResponse.json(
      { error: "Unable to load jokes right now.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
