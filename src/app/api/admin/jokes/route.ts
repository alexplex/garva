import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const joke = await prisma.joke.create({
      data: {
        content: content.trim(),
        upvotes: upvotes || 0,
        downvotes: downvotes || 0,
      },
    });

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

    const whereClause = search
      ? {
          content: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    // Validate sortBy to prevent SQL injection
    const validSortFields = ["id", "upvotes", "downvotes", "createdAt"];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : "id";
    const validatedSortOrder = sortOrder === "desc" ? "desc" : "asc";

    const jokes = await prisma.joke.findMany({
      where: whereClause,
      orderBy: {
        [validatedSortBy]: validatedSortOrder,
      },
    });

    return NextResponse.json({ jokes });
  } catch (error) {
    console.error("[api/admin/jokes] Error fetching jokes:", error);
    return NextResponse.json(
      { error: "Failed to fetch jokes", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
