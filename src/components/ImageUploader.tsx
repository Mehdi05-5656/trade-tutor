// src/components/ImageUploader.tsx
'use client'

import { useState } from 'react'

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string>('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (selected) {
      setPreview(URL.createObjectURL(selected))
      setAnalysis('') // clear previous
    }
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    const body = new FormData()
    body.append('file', file)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body,
      })
      const json = await res.json()
      // if you return { analysis } from the API, grab that
      setAnalysis(json.analysis ?? JSON.stringify(json, null, 2))
    } catch (err) {
      setAnalysis('Error uploading or parsing response.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        className="relative border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:border-gray-400"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="mx-auto max-h-64" />
        ) : (
          <p className="text-gray-600">
            Drag &amp; drop a chart here, or{' '}
            <button className="underline">click to select</button>
          </p>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing…' : 'Analyze Chart'}
      </button>

      {analysis && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Analysis</h2>
          <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
        </div>
      )}
    </div>
  )
}
