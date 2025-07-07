// src/app/[handle]/page.tsx
export const dynamic = 'force-dynamic'; // Add this line

import { getAuthenticatedAgent } from '@/lib/bsky-agent';
import { type AppBskyActorDefs, type AppBskyFeedDefs } from '@atproto/api';
import Link from 'next/link';
import Image from 'next/image';
import SkeetManager from '@/components/SkeetManager';
import { ArrowLeft, User, Users, MessageCircle } from 'lucide-react';

// Combined type for our initial data payload
interface PageData {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  initialFeed: AppBskyFeedDefs.FeedViewPost[];
  initialCursor?: string;
}

/**
 * Server-side function to get the initial data for the page.
 * Fetches the user's profile and the first page of their feed in parallel.
 */
async function getInitialPageData(handle: string, includeReplies: boolean): Promise<{ data?: PageData; error?: string }> {
  try {
    const agent = await getAuthenticatedAgent();
    const filter = includeReplies ? 'posts_with_replies' : 'posts_no_replies';

    // Fetch profile and first page of feed in parallel for speed
    const [profileRes, feedRes] = await Promise.all([
      agent.api.app.bsky.actor.getProfile({ actor: handle }),
      agent.api.app.bsky.feed.getAuthorFeed({ actor: handle, limit: 50, filter: filter }),
    ]);
    
    // **FIX:** Manually convert the fetched data to a plain object.
    // This prevents the "Only plain objects can be passed" error.
    const plainData = JSON.parse(JSON.stringify({
        profile: profileRes.data,
        initialFeed: feedRes.data.feed,
        initialCursor: feedRes.data.cursor,
    }));

    return { data: plainData };
  } catch (error) {
    const e = error as Error;
    if (e.message.includes('Profile not found')) {
      return { error: `Profile not found for "${handle}". Please check the handle.` };
    }
    console.error("Server Fetch Error:", error);
    return { error: "An unexpected error occurred while fetching user data." };
  }
}

// The main page component
export default async function UserSkeetsPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    // **FIX:** Directly use the destructured props as intended.
  const includeReplies = searchParams.replies !== 'false';
  const initialHideMedia = searchParams.hideMedia === 'true';
  const handle = params.handle;

  const { data, error } = await getInitialPageData(handle, includeReplies);

  if (error) {
    return (
        <main className="container mx-auto p-4 md:p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2">{error}</p>
            <Link href="/" className="inline-flex items-center gap-2 mt-4 text-blue-500 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Try again
            </Link>
        </main>
    );
  }

  if (!data || !data.profile) {
    return <main><p>Could not load profile data.</p></main>
  }

  return (
    <main className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
        
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start gap-6">
                <Image src={data.profile.avatar ?? '/default-avatar.png'} alt={data.profile.displayName ?? ''} width={80} height={80} className="rounded-full" />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800">{data.profile.displayName}</h1>
                    <p className="text-gray-500 text-lg">@{data.profile.handle}</p>
                    {data.profile.description && <p className="text-gray-700 mt-3 whitespace-pre-wrap">{data.profile.description}</p>}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /><span><strong>{data.profile.followersCount?.toLocaleString() ?? 0}</strong> followers</span></div>
                        <div className="flex items-center gap-1.5"><User className="w-4 h-4" /><span><strong>{data.profile.followsCount?.toLocaleString() ?? 0}</strong> following</span></div>
                        <div className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /><span><strong>{data.profile.postsCount?.toLocaleString() ?? 0}</strong> posts</span></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <SkeetManager
        handle={handle}
        initialFeed={data.initialFeed}
        initialCursor={data.initialCursor}
        initialHideMedia={initialHideMedia}
        filterReplies={includeReplies ? 'posts_with_replies' : 'posts_no_replies'}
      />

    </main>
  );
}