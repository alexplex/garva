import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content, upvotes, downvotes } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const { data: joke, error } = await supabase
      .from('jokes')
      .insert({
        content: content.trim(),
        upvotes: upvotes || 0,
        downvotes: downvotes || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/admin/jokes] Create error:", error);
      return NextResponse.json(
        { error: "Failed to create joke" },
        { status: 500 }
      );
    }

    return NextResponse.json({ joke });
  } catch (error) {
    console.error("[api/admin/jokes]", error);
    return NextResponse.json(
      { error: "Failed to create joke" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Validate sortBy to prevent SQL injection
    const validSortFields = ["id", "upvotes", "downvotes", "createdAt"];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : "id";
    const validatedSortOrder = sortOrder === "desc" ? "desc" : "asc";

    let query = supabase
      .from('jokes')
      .select('*')
      .order(validatedSortBy, { ascending: validatedSortOrder === 'asc' });

    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    const { data: jokes, error } = await query;

    if (error) {
      console.error("[api/admin/jokes] Error fetching jokes:", error);
      return NextResponse.json(
        { error: "Failed to fetch jokes", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ jokes });
  } catch (error) {
    console.error("[api/admin/jokes] Error fetching jokes:", error);
    return NextResponse.json(
      { error: "Failed to fetch jokes", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
