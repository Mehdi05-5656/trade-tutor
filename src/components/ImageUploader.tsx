'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

type Analysis = {
  analysis: string;
};

export default function ImageUploader() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data: Analysis = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <div className="p-8">
      <div
        {...getRootProps()}
        className={`w-full h-48 border-2 border-dashed flex items-center justify-center cursor-pointer ${
          isDragActive ? 'border-blue-500' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here …</p>
        ) : (
          <p>Drag & drop a chart image here, or click to select</p>
        )}
      </div>

      {loading && <p className="mt-4">Analyzing… please wait.</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      {analysis && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold">Analysis</h2>
          <pre className="whitespace-pre-wrap mt-2">{analysis.analysis}</pre>
        </div>
      )}
    </div>
  );
}
