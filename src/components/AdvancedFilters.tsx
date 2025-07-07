// src/components/AdvancedFilters.tsx
'use client';
import { ImageIcon, MessageSquareOff, Heart, Repeat } from 'lucide-react';

export interface Filters {
  searchTerm: string;
  sortBy: 'newest' | 'oldest' | 'likes' | 'reposts' | 'engagement';
  hasMedia: boolean;
  hideReplies: boolean;
  hideReposts: boolean; // Add new property
  minLikes: number;
}

interface AdvancedFiltersProps {
  filters: Filters;
  onFiltersChange: (newFilters: Partial<Filters>) => void;
}

export default function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200 sticky top-4 z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search in posts..."
          value={filters.searchTerm}
          onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
          className="lg:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        />

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value as Filters['sortBy'] })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="likes">Sort: Most Liked</option>
          <option value="reposts">Sort: Most Reposted</option>
          <option value="engagement">Sort: Top Engagement</option>
        </select>

        {/* Minimum Likes Input */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Heart className="w-4 h-4 text-gray-400" />
            </div>
            <input
                type="number"
                placeholder="Min Likes"
                min="0"
                value={filters.minLikes || ''}
                onChange={(e) => onFiltersChange({ minLikes: parseInt(e.target.value) || 0 })}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
        </div>
      </div>
        {/* Checkbox Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6">
        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filters.hasMedia} onChange={(e) => onFiltersChange({ hasMedia: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <ImageIcon className="w-4 h-4" />
            <span>Has Media</span>
        </label>
        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filters.hideReplies} onChange={(e) => onFiltersChange({ hideReplies: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <MessageSquareOff className="w-4 h-4" />
            <span>Hide Replies</span>
        </label>
        {/* Add new checkbox for hiding reposts */}
        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filters.hideReposts} onChange={(e) => onFiltersChange({ hideReposts: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <Repeat className="w-4 h-4" />
            <span>Hide Reposts</span>
        </label>
      </div>
    </div>
  );
}