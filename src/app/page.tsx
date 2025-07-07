// src/app/page.tsx
'use client';

import { useState } from 'react';
import SmartSearch from '@/components/SmartSearch';

export default function HomePage() {
  const [includeReplies, setIncludeReplies] = useState(true);
  const [hideReposts, setHideReposts] = useState(false); // Add this state
  const [startWithMediaHidden, setStartWithMediaHidden] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600">All My Skeets</h1>
        <p className="mt-2 text-lg text-gray-700">View and download all posts from a Bluesky user.</p>
      </div>

      <div className="mt-8 w-full max-w-lg">
        <SmartSearch 
          includeReplies={includeReplies} 
          hideReposts={hideReposts} // Pass the new state
          startWithMediaHidden={startWithMediaHidden} 
        />
        
        <div className="mt-4 flex justify-center flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" checked={includeReplies} onChange={(e) => setIncludeReplies(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Include Replies
          </label>
          {/* Add the new checkbox */}
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" checked={hideReposts} onChange={(e) => setHideReposts(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Hide Reposts
          </label>
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" checked={startWithMediaHidden} onChange={(e) => setStartWithMediaHidden(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Start with Media Hidden
          </label>
        </div>
      </div>
    </main>
  );
}