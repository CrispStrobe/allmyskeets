// src/components/ExportManager.tsx
'use client';

import { useState } from 'react';
import { type AppBskyFeedDefs } from '@atproto/api';
import { exportAsJson, exportAsCsv } from '@/lib/export';
import { Download, Loader2 } from 'lucide-react';

type PostView = AppBskyFeedDefs.PostView;
type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

export interface ExportManagerProps {
  posts: PostView[];
  handle: string;
  filterReplies: 'posts_with_replies' | 'posts_no_replies';
}

export default function ExportManager({ posts, handle, filterReplies }: ExportManagerProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ fetched: 0 });

  const handleExportAll = async () => {
    setIsExporting(true);
    setProgress({ fetched: 0 });
    let allPosts: PostView[] = [];
    let cursor: string | undefined = undefined;

    try {
      do {
        const response: Response = await fetch('/api/feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle, cursor, filter: filterReplies }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        const newPosts = data.feed.map((item: FeedViewPost) => item.post);
        allPosts = allPosts.concat(newPosts);
        cursor = data.cursor;
        setProgress({ fetched: allPosts.length });
      } while (cursor);
      
      if (format === 'json') {
        exportAsJson(allPosts, handle);
      } else if (format === 'csv') {
        exportAsCsv(allPosts, handle);
      }
    } catch (err) {
      const e = err as Error;
      console.error("Export all failed:", e);
      alert("An error occurred during the export process. Please check the console.");
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportFiltered = () => {
     if (format === 'json') {
      exportAsJson(posts, handle);
    } else if (format === 'csv') {
      exportAsCsv(posts, handle);
    }
    setShowOptions(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
            <h4 className="font-semibold text-gray-800 mb-3">Export Options</h4>
            <div className="space-y-4">
                <div>
                    <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <select
                        id="format-select"
                        value={format}
                        onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                        disabled={isExporting}
                        // bg-white and text-gray-900
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white text-gray-900"
                    >
                        <option value="json">JSON (Full Data)</option>
                        <option value="csv">CSV (Spreadsheet)</option>
                    </select>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-200">
                    <button
                        onClick={handleExportFiltered}
                        disabled={isExporting}
                        className="w-full text-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 disabled:opacity-50"
                    >
                        Export Filtered ({posts.length} posts)
                    </button>
                    <button
                        onClick={handleExportAll}
                        disabled={isExporting}
                        className="w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isExporting ? `Fetching... (${progress.fetched})` : "Export All Posts"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}