import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jokeId = parseInt(id, 10);

    if (isNaN(jokeId)) {
      return NextResponse.json(
        { error: "Invalid joke ID" },
        { status: 400 }
      );
    }

    const { content, upvotes, downvotes } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      content: content.trim(),
    };
    if (upvotes !== undefined) updateData.upvotes = upvotes;
    if (downvotes !== undefined) updateData.downvotes = downvotes;

    const { data: joke, error } = await supabase
      .from('jokes')
      .update(updateData)
      .eq('id', jokeId)
      .select()
      .single();

    if (error) {
      console.error("[api/admin/jokes/[id]] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update joke" },
        { status: 500 }
      );
    }

    return NextResponse.json({ joke });
  } catch (error) {
    console.error("[api/admin/jokes/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update joke" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jokeId = parseInt(id, 10);

    if (isNaN(jokeId)) {
      return NextResponse.json(
        { error: "Invalid joke ID" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('jokes')
      .delete()
      .eq('id', jokeId);

    if (error) {
      console.error("[api/admin/jokes/[id]] Delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete joke" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/jokes/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete joke" },
      { status: 500 }
    );
  }
}
