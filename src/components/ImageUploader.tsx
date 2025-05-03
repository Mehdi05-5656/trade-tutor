// src/components/ImageUploader.tsx
'use client'

import React, { useState, useRef } from 'react'

type AnalysisResult = {
  marketSession: string
  marketTrend: string
  recommendedEntry: string
  stopLoss: string
  takeProfit: string
  fairValueGaps: string[]
  tips: string[]
  otherPatterns: string[]
  analysis: string
}

export default function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
    setError(null)
  }

  async function onAnalyze() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const json = (await res.json()) as AnalysisResult
      setResult(json)
    } catch (err: unknown) {
      // Safely extract a string message
      const message =
        err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone / click-to-select */}
      <div
        className="border-2 border-blue-500 rounded h-48 flex items-center justify-center cursor-pointer bg-white"
        onClick={() => fileInputRef.current?.click()}
      >
        {file ? file.name : 'Drag & drop a chart image here, or click to select'}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={onSelectFile}
      />

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Analyzing…' : 'Analyze Chart'}
      </button>

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      {result && (
        <div className="bg-gray-50 p-6 rounded shadow space-y-4">
          <h2 className="text-2xl font-bold">📊 Chart Analysis</h2>

          <p><strong>Market Session:</strong> {result.marketSession}</p>
          <p><strong>Market Trend:</strong> {result.marketTrend}</p>
          <p><strong>Recommended Entry:</strong> {result.recommendedEntry}</p>
          <p><strong>Stop Loss:</strong> {result.stopLoss}</p>
          <p><strong>Take Profit:</strong> {result.takeProfit}</p>

          <div>
            <strong>Fair Value Gaps:</strong>
            <ul className="list-disc list-inside ml-4">
              {result.fairValueGaps.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Tips:</strong>
            <ul className="list-disc list-inside ml-4">
              {result.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Other Patterns:</strong>
            <ul className="list-disc list-inside ml-4">
              {result.otherPatterns.map((pat, i) => (
                <li key={i}>{pat}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Full Narrative:</strong>
            <p className="whitespace-pre-wrap">{result.analysis}</p>
          </div>
        </div>
      )}
    </div>
  )
}
