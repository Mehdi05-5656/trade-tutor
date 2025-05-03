'use client'

import { useState } from 'react'

interface FairValueGap {
  level: string
  type: string
}

interface Analysis {
  marketSession: string
  marketTrend: string
  recommendedEntry: string
  stopLoss: string
  takeProfit: string
  fairValueGaps: string[] | FairValueGap[]
  tips: string[] | string
  otherPatterns: string[]
  analysis: string
}

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string>('')

  async function onAnalyze() {
    if (!file) return
    setError('')
    setAnalysis(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
      setAnalysis(data as Analysis)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop / Click area */}
      <label
        htmlFor="chart-upload"
        className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition"
      >
        <input
          id="chart-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? file.name : 'Drag & drop a chart here, or click to select'}
      </label>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={!file}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Analyze Chart
      </button>

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      {analysis && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-bold">Analysis</h2>

          <p><strong>Session:</strong> {analysis.marketSession}</p>
          <p><strong>Trend:</strong> {analysis.marketTrend}</p>
          <p><strong>Entry:</strong> {analysis.recommendedEntry}</p>
          <p><strong>Stop Loss:</strong> {analysis.stopLoss}</p>
          <p><strong>Take Profit:</strong> {analysis.takeProfit}</p>

          <div>
            <strong>Fair Value Gaps:</strong>
            {Array.isArray(analysis.fairValueGaps) ? (
              <ul className="list-disc list-inside ml-4">
                {analysis.fairValueGaps.map((gap, i) => (
                  <li key={i}>
                    {typeof gap === 'string'
                      ? gap
                      : `${gap.level} (${gap.type})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>

          <div>
            <strong>Tips:</strong>
            {Array.isArray(analysis.tips) ? (
              <ul className="list-disc list-inside ml-4">
                {analysis.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            ) : (
              <p>{analysis.tips}</p>
            )}
          </div>

          <div>
            <strong>Other Patterns:</strong>
            <ul className="list-disc list-inside ml-4">
              {analysis.otherPatterns.map((pat, i) => <li key={i}>{pat}</li>)}
            </ul>
          </div>

          <p className="mt-4">{analysis.analysis}</p>
        </div>
      )}
    </div>
  )
}
