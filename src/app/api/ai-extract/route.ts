import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `Extract program/event details from this image and return ONLY a JSON object:
{
  "title": "",
  "organisation": "",
  "overview": "",
  "date": "",
  "deadline": "",
  "time": "",
  "location": "",
  "grades": "",
  "eligibility": "",
  "registrationLink": "",
  "type": "",
  "mode": "",
  "instructions": "",
  "tags": []
}

Rules:
- "type": one of: Summer Program, Competition, Workshop, Internship, In-Person Session, Virtual Session, Podcast, Information
- "mode": one of: Online, In-Person, Online/In-Person
- "grades": format like "9-12" or "10-11"
- "tags": 3-5 relevant keywords as array
- Leave fields empty string if not found
- Return ONLY the JSON, no other text`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = (file.type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";

  // Strip markdown code fences if model wrapped response
  const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  try {
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ error: "Could not parse AI response", raw: clean }, { status: 422 });
  }
}
