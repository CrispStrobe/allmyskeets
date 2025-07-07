// components/SkeetManager.tsx
'use client';

import { useState, useMemo } from 'react';
import { type AppBskyFeedDefs } from '@atproto/api';
import Skeet from './Skeet';
import AdvancedFilters, { type Filters } from './AdvancedFilters';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExportManager from './ExportManager';
import { Loader2, MessageCircle, BarChart3 } from 'lucide-react';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

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
  
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    sortBy: 'newest',
    hasMedia: false,
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
      setFeed(prevFeed => [...prevFeed, ...data.feed]);
      setCursor(data.cursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load more posts.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const processedFeedForRender = useMemo(() => {
    return [...feed]
      .filter(item => {
        const post = item.post;
        const record = post.record as any;
        if (filters.searchTerm && !record.text.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
        if (filters.hasMedia && !post.embed) return false;
        if (filters.minLikes > 0 && (post.likeCount ?? 0) < filters.minLikes) return false;
        return true;
      })
      .sort((a, b) => {
        const postA = a.post;
        const postB = b.post;
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
  
  const processedFeedForExport = useMemo(() => {
    return processedFeedForRender.map(item => item.post);
  }, [processedFeedForRender]);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('feed')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${viewMode === 'feed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
            <MessageCircle className="w-4 h-4"/> Feed
          </button>
          <button onClick={() => setViewMode('analytics')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
            <BarChart3 className="w-4 h-4"/> Analytics
          </button>
        </div>
        <ExportManager posts={processedFeedForExport} handle={handle} />
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
          <div className="space-y-4">
            {processedFeedForRender.map(item => (
              <Skeet key={item.post.uri} post={item.post} hideMedia={hideMedia} />
            ))}
          </div>
          {cursor && (
            <div className="text-center mt-8">
              <button onClick={loadMorePosts} disabled={isLoadingMore} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 mx-auto">
                {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
    </div>
  );
}