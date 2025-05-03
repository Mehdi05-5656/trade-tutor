// src/components/ImageUploader.tsx
'use client'

import { useState, ChangeEvent } from 'react'

interface AnalysisData {
  marketSession?: string
  marketTrend?: string
  recommendedEntry?: string
  stopLoss?: string
  takeProfit?: string
  fairValueGaps?: string[]
  tips?: string[]
  otherPatterns?: string[]
  analysis?: string
}

export default function ImageUploader() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AnalysisData | null>(null)
  const [raw, setRaw] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setError(null)
    setRaw(null)
    setData(null)

    const file = e.target.files?.[0] ?? null
    if (!file) return

    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Analysis failed')
      } else if ('raw' in json) {
        setRaw(json.raw)
      } else {
        setData(json as AnalysisData)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block"
      />

      {loading && <p>Analyzing…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {raw && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Raw Response</h2>
          <pre className="whitespace-pre-wrap text-sm">{raw}</pre>
        </div>
      )}

      {data && (
        <div className="p-4 bg-white rounded shadow space-y-2">
          <h2 className="text-xl font-bold">Analysis</h2>

          {data.marketSession && (
            <p><strong>Market Session:</strong> {data.marketSession}</p>
          )}
          {data.marketTrend && (
            <p><strong>Market Trend:</strong> {data.marketTrend}</p>
          )}
          {data.recommendedEntry && (
            <p><strong>Entry:</strong> {data.recommendedEntry}</p>
          )}
          {data.stopLoss && (
            <p><strong>Stop Loss:</strong> {data.stopLoss}</p>
          )}
          {data.takeProfit && (
            <p><strong>Take Profit:</strong> {data.takeProfit}</p>
          )}

          {Array.isArray(data.fairValueGaps) && (
            <div>
              <strong>Fair Value Gaps:</strong>
              <ul className="list-disc ml-6">
                {data.fairValueGaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}

          {Array.isArray(data.tips) && (
            <div>
              <strong>Tips:</strong>
              <ul className="list-disc ml-6">
                {data.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {Array.isArray(data.otherPatterns) && (
            <div>
              <strong>Other Patterns:</strong>
              <ul className="list-disc ml-6">
                {data.otherPatterns.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {data.analysis && (
            <div>
              <strong>Full Narrative:</strong>
              <p>{data.analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
