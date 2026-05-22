import { NextRequest, NextResponse } from "next/server";
import { generateInterviewAnalytics } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    const { role, qaPairs } = await req.json();

    if (!role || !qaPairs || !Array.isArray(qaPairs)) {
      return NextResponse.json({ error: "Missing role or qaPairs" }, { status: 400 });
    }

    const analytics = await generateInterviewAnalytics(role, qaPairs);
    return NextResponse.json(analytics);
  } catch (err: unknown) {
    console.error("Analytics API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
