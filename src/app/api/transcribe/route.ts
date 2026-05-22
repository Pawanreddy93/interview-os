import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as Blob;

    const response = await fetch(
      "https://api.deepgram.com/v1/listen",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm",
        },
        body: audio,
      }
    );

    const data = await response.json();

    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { transcript: "" },
      { status: 500 }
    );
  }
}
