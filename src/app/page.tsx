// src/app/page.tsx

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Trade-Tutor</h1>
        <p className="text-lg text-gray-700">
          Upload your chart and get AI-powered trading analysis—no mentor needed.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
