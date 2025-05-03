// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: Request) {
  // 1) Get the uploaded file
  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // 2) Convert it to a base64 Data URI
  const arrayBuffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i])
  }
  const b64 = btoa(binary)
  const imageDataUri = `data:${file.type};base64,${b64}`

  // 3) Prepare messages for ChatGPT
  const systemMessage = `
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
  `.trim()

  const userMessage = `Chart: ${imageDataUri}`

  // 4) Call the OpenAI Chat Completions API via fetch
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

  const json = await apiRes.json()
  const text = json.choices?.[0]?.message?.content || ''
  let data
  try {
    data = JSON.parse(text)
  } catch {
    // fallback if the response wasn’t strict JSON
    data = { raw: text }
  }

  // 5) Return the parsed JSON
  return NextResponse.json(data)
}
