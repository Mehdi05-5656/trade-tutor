// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server'
import Replicate from 'replicate'

export const runtime = 'edge'

export async function POST(req: Request) {
  // 1. Get the uploaded file
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // 2. Upload the file to Replicate and grab its public URL
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
  const fileRes = await replicate.files.create(file)
  const imageUrl = fileRes.urls.get
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 502 }
    )
  }

  // 3. Build your prompt (just the URL now)
  const systemMessage = `
You are a lightning-fast, pixel-perfect day-trading coach.
You will be shown only a chart image URL and nothing else.
Inspect the chart visually and extract exact price and time values—do not invent or estimate.
Return strictly valid JSON with these keys:
  marketSession, marketTrend, recommendedEntry, stopLoss, takeProfit,
  fairValueGaps, tips, otherPatterns, analysis
No commentary, no markdown—only the JSON object.
  `.trim()

  const userMessage = `Chart image URL: ${imageUrl}`

  // 4. Call OpenAI’s chat endpoint via fetch
  const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
    }),
  })
  if (!apiRes.ok) {
    const errText = await apiRes.text()
    return NextResponse.json({ error: errText }, { status: apiRes.status })
  }

  // 5. Parse and return
  const json = await apiRes.json()
  const text = json.choices?.[0]?.message?.content || ''
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return NextResponse.json(
      { error: 'AI did not return valid JSON' },
      { status: 502 }
    )
  }

  return NextResponse.json(data)
}
