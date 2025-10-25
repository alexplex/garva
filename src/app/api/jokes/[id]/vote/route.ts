import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type VoteAction = "upvote" | "downvote" | "unvote";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jokeId = parseInt(id, 10);

    if (isNaN(jokeId)) {
      return NextResponse.json(
        { error: "Invalid joke ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, previousVote } = body as {
      action: VoteAction;
      previousVote?: "upvote" | "downvote" | null;
    };

    if (!["upvote", "downvote", "unvote"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'upvote', 'downvote', or 'unvote'" },
        { status: 400 }
      );
    }

    // Check if joke exists
    const joke = await prisma.joke.findUnique({
      where: { id: jokeId },
    });

    if (!joke) {
      return NextResponse.json(
        { error: "Joke not found" },
        { status: 404 }
      );
    }

    // Calculate the vote changes
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    // Handle removing previous vote
    if (previousVote === "upvote") {
      upvoteDelta -= 1;
    } else if (previousVote === "downvote") {
      downvoteDelta -= 1;
    }

    // Handle adding new vote
    if (action === "upvote") {
      upvoteDelta += 1;
    } else if (action === "downvote") {
      downvoteDelta += 1;
    }

    // Update the joke with the deltas
    const updatedJoke = await prisma.joke.update({
      where: { id: jokeId },
      data: {
        upvotes: {
          increment: upvoteDelta,
        },
        downvotes: {
          increment: downvoteDelta,
        },
      },
    });

    return NextResponse.json({
      success: true,
      upvotes: updatedJoke.upvotes,
      downvotes: updatedJoke.downvotes,
    });
  } catch (error) {
    console.error("[api/jokes/vote]", error);
    return NextResponse.json(
      { error: "Unable to process vote" },
      { status: 500 }
    );
  }
}
