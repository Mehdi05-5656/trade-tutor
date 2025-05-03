// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai-edge'   // correct default import

export const runtime = 'edge'

export async function POST(req: Request) {  // renamed from `request`
  // 1) Receive the uploaded file
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json(
      { error: 'No file uploaded' },
      { status: 400 }
    )
  }

  // 2) Read & encode as base64 Data URI
  const arrayBuffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(arrayBuffer)
  let binary = ''
  for (const b of uint8) binary += String.fromCharCode(b)
  const b64 = btoa(binary)
  const imageDataUri = `data:${file.type};base64,${b64}`

  // 3) Call the OpenAI API via fetch
  const apiRes = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
You are a lightning-fast, pixel-perfect day-trading coach.
You will be shown only a chart image and nothing else.
Inspect the chart visually and extract exact price and time values — do not invent or estimate.
Return **strictly valid JSON** with these keys:
  marketSession, marketTrend, recommendedEntry, stopLoss, takeProfit,
  fairValueGaps, tips, otherPatterns, analysis
No commentary, no markdown—only the JSON object.
            `.trim(),
          },
          {
            role: 'user',
            content: `Chart image (base64 URI):\n${imageDataUri}`,
          },
        ],
        max_tokens: 500,
      }),
    }
  )

  if (!apiRes.ok) {
    const errText = await apiRes.text()
    return NextResponse.json(
      { error: errText },
      { status: apiRes.status }
    )
  }

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
