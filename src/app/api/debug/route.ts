import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (hidden)" : "Not set",
    },
  };

  try {
    // Test connection
    diagnostics.connectionTest = "Attempting connection...";
    const { count, error: countError } = await supabase
      .from('jokes')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      diagnostics.error = countError.message;
      diagnostics.errorDetails = countError;
      diagnostics.status = "❌ Connection error";
      return NextResponse.json(diagnostics);
    }

    diagnostics.jokeCount = count;

    if (count && count > 0) {
      const { data: sample, error: sampleError } = await supabase
        .from('jokes')
        .select('*')
        .limit(1)
        .single();

      if (!sampleError && sample) {
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
