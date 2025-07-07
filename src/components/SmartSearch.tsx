// src/components/SmartSearch.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type AppBskyActorDefs } from '@atproto/api';
import { Loader2, Search } from 'lucide-react';
import Image from 'next/image';

interface SmartSearchProps {
  includeReplies: boolean;
  hideReposts: boolean;
  startWithMediaHidden: boolean;
}

export default function SmartSearch({ includeReplies, hideReposts, startWithMediaHidden }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AppBskyActorDefs.ProfileView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const debounce = useCallback((func: (term: string) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (term: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(term);
      }, delay);
    };
  }, []);

  const searchForActors = async (term: string) => {
    if (term.length < 2) {
        setSuggestions([]);
        return;
    };
    setIsLoading(true);
    try {
      const response = await fetch('/api/search-actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term }),
      });
      const data = await response.json();
      if (data.actors) {
        setSuggestions(data.actors);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchForActors, 300), [debounce]);
  
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const navigateToProfile = (handle: string) => {
    if (!handle) return;
    const params = new URLSearchParams();
    params.set('replies', String(includeReplies));
    params.set('hideReposts', String(hideReposts));
    params.set('hideMedia', String(startWithMediaHidden));
    router.push(`/${handle}?${params.toString()}`);
  };
  
  // FIX: This function is now smarter about what it navigates to.
  const handleFetchClick = () => {
    // If the query looks like a full handle, use it.
    if (query.includes('.')) {
        navigateToProfile(query);
    } 
    // Otherwise, if there are suggestions, use the first one.
    else if (suggestions.length > 0) {
        navigateToProfile(suggestions[0].handle);
    }
    // If neither, do nothing to prevent the error.
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
        <div className="flex gap-2">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchClick()}
                    placeholder="Search by handle or display name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
                {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}
            </div>
             <button
                onClick={handleFetchClick}
                className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
             >
                Fetch
            </button>
        </div>
        
        {suggestions.length > 0 && query && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {suggestions.map(actor => (
                    <button
                        key={actor.did}
                        onClick={() => navigateToProfile(actor.handle)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3"
                    >
                        <Image src={actor.avatar ?? '/default-avatar.png'} alt={actor.displayName ?? ''} width={40} height={40} className="rounded-full" />
                        <div>
                            <p className="font-semibold text-gray-800">{actor.displayName || actor.handle}</p>
                            <p className="text-sm text-gray-500">@{actor.handle}</p>
                        </div>
                    </button>
                ))}
            </div>
        )}
    </div>
  );
}