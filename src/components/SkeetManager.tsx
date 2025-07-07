// src/components/SkeetManager.tsx
'use client';

import { useState, useMemo } from 'react';
import { AppBskyFeedDefs, AppBskyEmbedImages } from '@atproto/api';
import AdvancedFilters, { type Filters } from './AdvancedFilters';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExportManager from './ExportManager';
import Thread, { type ThreadView } from './Thread';
import { Loader2 } from 'lucide-react';

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

interface FeedApiResponse {
  feed: FeedViewPost[];
  cursor?: string;
  error?: string;
}

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
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [progress, setProgress] = useState({ fetched: 0 });

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    sortBy: 'newest',
    hasMedia: false,
    hideReplies: false,
    hideReposts: false, 
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
      const data: FeedApiResponse = await response.json();
      if (data.error) throw new Error(data.error);
      
      setFeed(prevFeed => {
        const existingUris = new Set(prevFeed.map(item => item.post.uri));
        const newUniqueItems = data.feed.filter((item) => !existingUris.has(item.post.uri));
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
        const data: FeedApiResponse = await response.json();
        if (data.error) throw new Error(data.error);
        
        const existingUris = new Set(allPosts.map(item => item.post.uri));
        const newUniqueItems = data.feed.filter((item) => !existingUris.has(item.post.uri));

        allPosts = allPosts.concat(newUniqueItems);
        currentCursor = data.cursor;
        setFeed(allPosts);
        setProgress({ fetched: allPosts.length });
      }
      setCursor(undefined);
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Failed to load all posts.');
    } finally {
      setIsLoadingAll(false);
    }
  };

  const threads = useMemo((): ThreadView[] => {
    const filteredFeed = [...feed].filter(item => {
        if (filters.hideReposts && item.reason?.$type === 'app.bsky.feed.defs#reasonRepost') {
            return false;
        }

        const post = item.post;
        const record = post.record as PostRecord;
        if (filters.hideReplies && record.reply) return false;
        if (filters.searchTerm && !record.text.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
        if (filters.hasMedia) {
            // Use the imported object, not the type, for the check
            const hasImages = AppBskyEmbedImages.isView(post.embed);
            if (!hasImages) return false;
        }
        if (filters.minLikes > 0 && (post.likeCount ?? 0) < filters.minLikes) return false;
        return true;
    });

    const postsByUri = new Map<string, ThreadView>();
    const rootThreads: ThreadView[] = [];

    for (const item of filteredFeed) {
        postsByUri.set(item.post.uri, { post: item, replies: [] });
    }

    for (const threadView of postsByUri.values()) {
        const parentUri = (threadView.post.post.record as PostRecord).reply?.parent.uri;
        if (parentUri && postsByUri.has(parentUri)) {
            postsByUri.get(parentUri)!.replies!.push(threadView);
        } else {
            rootThreads.push(threadView);
        }
    }

    return rootThreads.sort((a, b) => {
        const postA = a.post.post;
        const postB = b.post.post;
        switch (filters.sortBy) {
          case 'oldest': return new Date(postA.indexedAt).getTime() - new Date(postB.indexedAt).getTime();
          case 'likes': return (postB.likeCount ?? 0) - (postA.likeCount ?? 0);
          case 'reposts': return (postB.repostCount ?? 0) - (postA.repostCount ?? 0);
          case 'engagement':
             const engagementA = (postA.likeCount ?? 0) + (postA.repostCount ?? 0);
             const engagementB = (postB.likeCount ?? 0) + (postB.repostCount ?? 0);
             return engagementB - engagementA;
          default: return new Date(postB.indexedAt).getTime() - new Date(postA.indexedAt).getTime();
        }
    });
  }, [feed, filters]);
  
  const processedFeedForExport = useMemo((): PostView[] => {
    const allPosts: PostView[] = [];
    function flattenThreads(thread: ThreadView) {
        allPosts.push(thread.post.post);
        if (thread.replies) {
            for (const reply of thread.replies) {
                flattenThreads(reply);
            }
        }
    }
    threads.forEach(flattenThreads);
    return allPosts; // FIX: Added missing return statement
  }, [threads]);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('feed')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${viewMode === 'feed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
            Feed
          </button>
          <button onClick={() => setViewMode('analytics')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
            Analytics
          </button>
        </div>
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