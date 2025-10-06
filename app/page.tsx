// app/page.tsx
'use client'; // This tells Next.js that this is a client-side component

import { useState } from 'react';

export default function HomePage() {
  const [prd, setPrd] = useState('');
  const [blogPost, setBlogPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setBlogPost('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the API call.');
      }

      const data = await response.json();
      setBlogPost(data.blogPost);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="z-10 w-full max-w-4xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Multi-Agent Content Pipeline 🤖✍️🔍✨
        </h1>

        <form onSubmit={handleSubmit} className="w-full bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="prd" className="block mb-2 text-lg font-medium text-gray-900">
              Enter your Product Requirements Doc (PRD)
            </label>
            <textarea
              id="prd"
              rows={8}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., We are launching a new AI-powered calendar app called 'TimeWise'. It automatically schedules meetings based on team availability and project priorities. Key features include natural language event creation, integration with Slack, and a smart 'focus time' booking system."
              value={prd}
              onChange={(e) => setPrd(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Blog Post'}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500">Error: {error}</p>}

        {blogPost && (
          <div className="mt-10 w-full bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Generated Blog Post:</h2>
            <div className="prose lg:prose-xl whitespace-pre-wrap">
              {blogPost}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}