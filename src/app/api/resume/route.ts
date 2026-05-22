import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeWithGroq } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, role } = await req.json();

    if (!resumeText || !role) {
      return NextResponse.json({ error: "Missing resumeText or role" }, { status: 400 });
    }

    const analysis = await analyzeResumeWithGroq(resumeText, role);
    return NextResponse.json(analysis);
  } catch (err: unknown) {
    console.error("Resume API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
