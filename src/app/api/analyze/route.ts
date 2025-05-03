// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai-edge'

export const runtime = 'edge'

export async function POST(request: Request) {
  // … your file→dataUri boilerplate …

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          `You are a lightning-fast, pixel-perfect day-trading coach.`,
          `You will be shown only a chart image and nothing else.`,
          `**Your job:** inspect the chart visually and extract **exact** price and time values directly from what you see—do not invent, estimate, or round.`,
          `Return strictly valid JSON, with these keys:`,
          `  • marketSession (e.g. "New York", "London", etc.),`,
          `  • marketTrend ("Bullish" or "Bearish"),`,
          `  • recommendedEntry (exact price string as shown),`,
          `  • stopLoss (exact price),`,
          `  • takeProfit (exact price),`,
          `  • fairValueGaps (array of price–price ranges exactly as on chart),`,
          `  • tips (array of concise guidance items),`,
          `  • otherPatterns (array of any other chart patterns you spot),`,
          `  • analysis (one paragraph summary in natural language).`,
          `No extra keys, no commentary, no markdown—just the JSON object.`
        ].join(' ')
      },
      {
        role: 'user',
        content: `Chart image (base64 data URI):\n${imageDataUri}`
      }
    ]
  })

  if (!completion.choices?.length) {
    return NextResponse.json({ error: 'No response from AI' }, { status: 502 })
  }

  // The API always returns a JSON string as its first message
  let parsed
  try {
    parsed = JSON.parse(completion.choices[0].message?.content || '')
  } catch {
    return NextResponse.json({ error: 'AI response not valid JSON' }, { status: 502 })
  }

  return NextResponse.json(parsed)
}
