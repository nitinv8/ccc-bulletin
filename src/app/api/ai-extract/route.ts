import { generateText, gateway } from "ai";
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
  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: "AI_GATEWAY_API_KEY not configured" },
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
  const mediaType = (file.type || "image/jpeg") as string;

  const { text } = await generateText({
    model: gateway("anthropic/claude-3-5-haiku"),
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: `data:${mediaType};base64,${base64}`, mimeType: mediaType },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  try {
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ error: "Could not parse AI response", raw: clean }, { status: 422 });
  }
}
