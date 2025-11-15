import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars: {
      DATABASE_URL: process.env.DATABASE_URL ? "Set (hidden)" : "Not set",
      DIRECT_URL: process.env.DIRECT_URL ? "Set (hidden)" : "Not set",
    },
  };

  try {
    // Test connection
    diagnostics.connectionTest = "Attempting connection...";
    const count = await prisma.joke.count();

    diagnostics.jokeCount = count;

    if (count > 0) {
      const sample = await prisma.joke.findFirst();

      if (sample) {
        diagnostics.sampleJoke = {
          id: sample.id,
          contentLength: sample.content.length,
          upvotes: sample.upvotes,
          downvotes: sample.downvotes,
        };
      }
    }

    diagnostics.status = "✅ All tests passed";
  } catch (error) {
    diagnostics.error = error instanceof Error ? error.message : String(error);
    diagnostics.errorName = error instanceof Error ? error.name : "Unknown";
    diagnostics.errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined;
    diagnostics.status = "❌ Error occurred";
  }

  return NextResponse.json(diagnostics);
}
