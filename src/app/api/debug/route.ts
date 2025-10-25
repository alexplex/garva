import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars: {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "Set" : "Not set",
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "Set" : "Not set",
    },
  };

  try {
    // Only import Prisma if we have the connection string
    if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
      diagnostics.error = "No database connection string found";
      diagnostics.status = "❌ No connection string";
      return NextResponse.json(diagnostics);
    }

    const { prisma } = await import("@/lib/prisma");

    // Test connection
    diagnostics.connectionTest = "Attempting connection...";
    const count = await prisma.joke.count();
    diagnostics.jokeCount = count;

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
    diagnostics.errorName = error instanceof Error ? error.name : "Unknown";
    diagnostics.errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined;
    diagnostics.status = "❌ Error occurred";
  }

  return NextResponse.json(diagnostics);
}
