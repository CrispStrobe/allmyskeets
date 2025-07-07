// src/components/SkeetManager.tsx
'use client';

import { useState, useMemo } from 'react';
import { type AppBskyFeedDefs, type AppBskyEmbedImages } from '@atproto/api';
import AdvancedFilters, { type Filters } from './AdvancedFilters';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExportManager from './ExportManager';
import Thread, { type ThreadView } from './Thread';
import { Loader2, MessageCircle, BarChart3 } from 'lucide-react';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostView = AppBskyFeedDefs.PostView;
type PostRecord = {
  text: string;
  createdAt: string;
  reply?: {
    parent: {
      uri: string;
    }
  }
};

interface SkeetManagerProps {
  handle: string;
  initialFeed: FeedViewPost[];
  initialCursor?: string;
  initialHideMedia: boolean;
  filterReplies: 'posts_with_replies' | 'posts_no_replies';
}

export default function SkeetManager({
  handle,
  initialFeed,
  initialCursor,
  initialHideMedia,
  filterReplies
}: SkeetManagerProps) {
  const [feed, setFeed] = useState<FeedViewPost[]>(initialFeed);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  // NEW: State for the "Load All" process
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [progress, setProgress] = useState({ fetched: 0 });

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    sortBy: 'newest',
    hasMedia: false,
    hideReplies: false,
    minLikes: 0,
  });

  const [hideMedia, setHideMedia] = useState(initialHideMedia);
  const [viewMode, setViewMode] = useState<'feed' | 'analytics'>('feed');

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const loadMorePosts = async () => {
    if (!cursor) return;
    setIsLoadingMore(true);
    setError('');
    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, cursor, filter: filterReplies }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setFeed(prevFeed => {
        const existingUris = new Set(prevFeed.map(item => item.post.uri));
        const newUniqueItems = data.feed.filter((item: FeedViewPost) => !existingUris.has(item.post.uri));
        return [...prevFeed, ...newUniqueItems];
      });
      setCursor(data.cursor);
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Failed to load more posts.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // NEW: Function to loop and load all posts
  const handleLoadAll = async () => {
    setIsLoadingAll(true);
    setProgress({ fetched: initialFeed.length });
    setError('');

    let allPosts: FeedViewPost[] = [...initialFeed];
    let currentCursor = initialCursor;

    try {
      while (currentCursor) {
        const response = await fetch('/api/feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle, cursor: currentCursor, filter: filterReplies }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        const existingUris = new Set(allPosts.map(item => item.post.uri));
        const newUniqueItems = data.feed.filter((item: FeedViewPost) => !existingUris.has(item.post.uri));

        allPosts = allPosts.concat(newUniqueItems);
        currentCursor = data.cursor;
        
        setFeed(allPosts);
        setProgress({ fetched: allPosts.length });
      }
      setCursor(undefined); // All posts are loaded
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Failed to load all posts.');
    } finally {
      setIsLoadingAll(false);
    }
  };

  const threads = useMemo(() => {
    const filteredFeed = [...feed].filter(item => {
        const post = item.post;
        const record = post.record as PostRecord;
        if (filters.hideReplies && record.reply) return false;
        if (filters.searchTerm && !record.text.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
        if (filters.hasMedia) {
            const hasImages = AppBskyEmbedImages.isView(post.embed);
            if (!hasImages) return false;
        }
        if (filters.minLikes > 0 && (post.likeCount ?? 0) < filters.minLikes) return false;
        return true;
    });
    // ... rest of the thread logic is unchanged
  }, [feed, filters]);
  
  const processedFeedForExport = useMemo((): PostView[] => {
    // ... export logic is unchanged
  }, [threads]);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* ... View mode buttons are unchanged ... */}
        <ExportManager posts={processedFeedForExport} handle={handle} filterReplies={filterReplies}/>
      </div>

      {viewMode === 'analytics' && <AnalyticsDashboard feed={feed} />}

      {viewMode === 'feed' && (
        <>
          <AdvancedFilters filters={filters} onFiltersChange={handleFilterChange} />
          <div className="flex justify-end mb-4 -mt-4 mr-4">
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input type="checkbox" checked={hideMedia} onChange={(e) => setHideMedia(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Hide Media
            </label>
          </div>
          <div className="space-y-6">
            {threads.map(thread => (
              <Thread key={thread.post.post.uri} thread={thread} hideMedia={hideMedia} />
            ))}
          </div>
          
          {/* NEW: Load More / Load All controls */}
          {cursor && (
            <div className="text-center mt-8 flex items-center justify-center gap-4">
              <button onClick={loadMorePosts} disabled={isLoadingMore || isLoadingAll} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 mx-auto">
                {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
              <button onClick={handleLoadAll} disabled={isLoadingMore || isLoadingAll} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 mx-auto">
                {isLoadingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoadingAll ? `Loading... (${progress.fetched})` : 'Load All Posts'}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
    </div>
  );
}