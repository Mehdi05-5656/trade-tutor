// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import Replicate from "replicate";

export const runtime = "edge";

export async function POST(request: Request) {
  // 1) Receive the image file
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // 2) Upload to Replicate’s file store
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const fileRes = await replicate.files.create(file);
  const imageUrl = fileRes.urls.get;  // publicly accessible URL

  // 3) Build the prompt (tiny now, just the URL)
  const systemMessage = `
You are a pro day‐trading coach.
Given only a chart image URL, return **only** valid JSON with these keys:
  • marketSession  
  • marketTrend  
  • recommendedEntry  
  • stopLoss  
  • takeProfit  
  • fairValueGaps  
  • tips  
  • otherPatterns  
  • analysis
  `.trim();

  const userMessage = `Chart image URL: ${imageUrl}`;

  // 4) Ask ChatGPT via REST (no bulky base64!)
  const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
    }),
  });

  if (!apiRes.ok) {
    const errText = await apiRes.text();
    return NextResponse.json({ error: errText }, { status: apiRes.status });
  }

  const json = await apiRes.json();
  const text = json.choices?.[0]?.message?.content || "";
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  // 5) Return it to the client
  return NextResponse.json(data);
}
