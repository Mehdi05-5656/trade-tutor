// src/components/ImageUploader.tsx
'use client'

import { useState, useCallback, DragEvent, ChangeEvent } from 'react'

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
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (file: File) => {
    setError(null)
    setData(null)
    setLoading(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Analysis failed')
      }
      // if the API returned { raw: string } it will show under `.analysis`
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFiles(file)
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(true)
  }

  function onDragLeave() {
    setDragOver(false)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFiles(file)
  }

  return (
    <div className="space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition 
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {loading
          ? <span className="text-gray-500">Processing…</span>
          : <>Drag &amp; drop a chart here, or <strong>click to select</strong></>
        }
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600">{error}</div>
      )}

      {data && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Analysis</h2>

          {data.marketSession && (
            <p><span className="font-medium">Session:</span> {data.marketSession}</p>
          )}
          {data.marketTrend && (
            <p><span className="font-medium">Trend:</span> {data.marketTrend}</p>
          )}
          {data.recommendedEntry && (
            <p><span className="font-medium">Entry:</span> {data.recommendedEntry}</p>
          )}
          {data.stopLoss && (
            <p><span className="font-medium">Stop Loss:</span> {data.stopLoss}</p>
          )}
          {data.takeProfit && (
            <p><span className="font-medium">Take Profit:</span> {data.takeProfit}</p>
          )}

          {data.fairValueGaps?.length && (
            <div>
              <span className="font-medium">Fair Value Gaps:</span>
              <ul className="list-disc ml-5">
                {data.fairValueGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {data.tips?.length && (
            <div>
              <span className="font-medium">Tips:</span>
              <ul className="list-disc ml-5">
                {data.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {data.otherPatterns?.length && (
            <div>
              <span className="font-medium">Other Patterns:</span>
              <ul className="list-disc ml-5">
                {data.otherPatterns.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {data.analysis && (
            <div>
              <span className="font-medium">Narrative:</span>
              <p className="mt-1">{data.analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
