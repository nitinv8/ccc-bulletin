import { generateText, gateway } from "ai";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `Extract program/event details from the text below and return ONLY a JSON object:
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
- Return ONLY the JSON, no other text

Event text:`;

export async function POST(req: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json({ error: "AI_GATEWAY_API_KEY not configured" }, { status: 503 });
  }

  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const { text: result } = await generateText({
    model: gateway("anthropic/claude-haiku-4.5"),
    messages: [{ role: "user", content: `${PROMPT}\n\n${text}` }],
  });

  const clean = result.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  try {
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ error: "Could not parse AI response", raw: clean }, { status: 422 });
  }
}
