import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "Not set",
  };

  try {
    // Test 1: Can we connect to the database?
    await prisma.$connect();
    diagnostics.connection = "✅ Connected";

    // Test 2: Can we count jokes?
    const count = await prisma.joke.count();
    diagnostics.jokeCount = count;

    // Test 3: Can we fetch one joke?
    if (count > 0) {
      const sample = await prisma.joke.findFirst();
      diagnostics.sampleJoke = sample
        ? {
            id: sample.id,
            contentLength: sample.content.length,
            upvotes: sample.upvotes,
            downvotes: sample.downvotes,
          }
        : null;
    }

    diagnostics.status = "✅ All tests passed";
  } catch (error) {
    diagnostics.error = error instanceof Error ? error.message : String(error);
    diagnostics.errorStack = error instanceof Error ? error.stack : undefined;
    diagnostics.status = "❌ Error occurred";
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(diagnostics, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
