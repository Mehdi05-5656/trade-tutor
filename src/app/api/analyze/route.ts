// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai-edge";

export const runtime = "edge";

// Initialize the Edge-compatible client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  // 1) Get the uploaded file
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // 2) Read and encode as base64 Data URI
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  const imageDataUri = `data:${file.type};base64,${b64}`;

  // 3) Ask GPT-4o Mini to analyze your chart
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a pro day-trading coach.
Given only a chart image, return JSON with exactly these fields:
  • marketSession
  • marketTrend
  • recommendedEntry
  • stopLoss
  • takeProfit
  • fairValueGaps
  • tips
  • otherPatterns
  • analysis

Output only valid JSON (no extraneous text).
        `.trim(),
      },
      {
        role: "user",
        content: `Chart: ${imageDataUri}`,
      },
    ],
    max_tokens: 500,
  });

  // 4) Pull out the raw text
  const text = resp.choices?.[0]?.message?.content || "";
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // If not strict JSON, fall back to a raw field
    data = { raw: text };
  }

  // 5) Return JSON to the client
  return NextResponse.json(data);
}
