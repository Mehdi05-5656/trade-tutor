// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'

export const runtime = 'edge'

export async function POST(request: Request) {
  // 1) Receive the uploaded file
  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // 2) Convert it to a base64 data URI
  const arrayBuffer = await file.arrayBuffer()
  const b64 = Buffer.from(arrayBuffer).toString('base64')
  const imageDataUri = `data:${file.type};base64,${b64}`

  // 3) Call ChatGPT Vision (you need OPENAI_API_KEY in your env)
  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  )

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `
