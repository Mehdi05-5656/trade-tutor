export const runtime = 'edge';

import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  // 1) Parse the uploaded file
  const formData = await request.formData();
  const file = formData.get('file') as Blob;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // 2) Host it on Replicate's file store
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  });
  const fileRes = await replicate.files.create(file);
  const imageUrl = fileRes.urls.get;

  // 3) Ask ChatGPT to analyze the chart
  const prompt = `
You are a patient, clear trading coach. A user gave you a chart:
${imageUrl}

Please:
1) Identify any Fair Value Gaps and describe them.
2) State whether the market bias is bullish or bearish.
3) Recommend an entry price, a stop-loss, and a take-profit.
4) Explain in a teaching style so the user learns how you arrived at each point.
`;
  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    }),
  });

  if (!chatRes.ok) {
    const err = await chatRes.text();
    return NextResponse.json({ error: err }, { status: chatRes.status });
  }

  const { choices } = await chatRes.json();
  const analysis = choices[0].message.content as string;

  // 4) Return as a single string
  return NextResponse.json({ analysis });
}
