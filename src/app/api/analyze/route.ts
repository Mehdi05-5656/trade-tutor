// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'

export const runtime = 'edge'

export async function POST(request: Request) {
  // 1) Parse the uploaded file
  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // 2) Convert it to a base64 data URI
  const arrayBuffer = await file.arrayBuffer()
  const b64 = Buffer.from(arrayBuffer).toString('base64')
  const imageDataUri = `data:${file.type};base64,${b64}`

  // 3) Call ChatGPT Vision
  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  )

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a pro day-trading coach.
Given only a chart image, return JSON with these fields:
• marketSession
• marketTrend
• recommendedEntry
• stopLoss
• takeProfit
• fairValueGaps
• tips
• otherPatterns
• analysis

Output only valid JSON (no extra text).`,
      },
      {
        role: 'user',
        content: `Chart: ${imageDataUri}`,
      },
    ],
    max_tokens: 500,
  })

  // 4) Handle API errors
  if (!completion.ok) {
    const errText = await completion.text()
    return NextResponse.json({ error: errText }, { status: completion.status })
  }

  // 5) Parse the JSON out of the model’s reply
  const { choices } = await completion.json()
  const text = choices?.[0]?.message?.content || ''
  let data
  try {
    data = JSON.parse(text)
  } catch {
    // fallback if it wasn’t strictly JSON
    data = { raw: text }
  }

  // 6) Return structured JSON
  return NextResponse.json(data)
}
