// src/components/ImageUploader.tsx
'use client'

import { useState, ChangeEvent } from 'react'

interface AnalysisData {
  marketSession?: string
  marketTrend?: string
  recommendedEntry?: string
  stopLoss?: string
  takeProfit?: string
  fairValueGaps?: unknown
  tips?: unknown
  otherPatterns?: unknown
  analysis?: string
}

function isStringArray(maybe: unknown): maybe is string[] {
  return Array.isArray(maybe) && maybe.every(item => typeof item === 'string')
}

export default function ImageUploader() {
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [raw, setRaw] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setError(null)
    setRaw(null)
    setAnalysisData(null)

    const file = e.target.files?.[0] ?? null
    if (!file) return

    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analysis failed')
      } else if ('raw' in data) {
        setRaw(data.raw)
      } else {
        setAnalysisData(data as AnalysisData)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
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

      {analysisData && (
        <div className="p-4 bg-white rounded shadow space-y-2">
          <h2 className="text-xl font-bold">Analysis</h2>

          {analysisData.marketSession && (
            <p>
              <strong>Market Session:</strong> {analysisData.marketSession}
            </p>
          )}
          {analysisData.marketTrend && (
            <p>
              <strong>Market Trend:</strong> {analysisData.marketTrend}
            </p>
          )}
          {analysisData.recommendedEntry && (
            <p>
              <strong>Recommended Entry:</strong> {analysisData.recommendedEntry}
            </p>
          )}
          {analysisData.stopLoss && (
            <p>
              <strong>Stop Loss:</strong> {analysisData.stopLoss}
            </p>
          )}
          {analysisData.takeProfit && (
            <p>
              <strong>Take Profit:</strong> {analysisData.takeProfit}
            </p>
          )}

          {isStringArray(analysisData.fairValueGaps) && (
            <div>
              <strong>Fair Value Gaps:</strong>
              <ul className="list-disc ml-6">
                {analysisData.fairValueGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {isStringArray(analysisData.tips) && (
            <div>
              <strong>Tips:</strong>
              <ul className="list-disc ml-6">
                {analysisData.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {isStringArray(analysisData.otherPatterns) && (
            <div>
              <strong>Other Patterns:</strong>
              <ul className="list-disc ml-6">
                {analysisData.otherPatterns.map((pat, i) => (
                  <li key={i}>{pat}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisData.analysis && (
            <div>
              <strong>Full Narrative:</strong>
              <p>{analysisData.analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
