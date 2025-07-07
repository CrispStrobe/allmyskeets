// app/api/feed/route.ts
import { getAuthenticatedAgent } from '@/lib/bsky-agent';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { handle, cursor, filter } = await request.json();

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    const agent = await getAuthenticatedAgent();
    const response = await agent.api.app.bsky.feed.getAuthorFeed({
      actor: handle,
      limit: 50, // Fetch in batches of 50
      cursor: cursor,
      filter: filter,
    });

    if (!response.data) {
      return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
    }

    // Return only the necessary data to the client
    return NextResponse.json({
      feed: response.data.feed,
      cursor: response.data.cursor,
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}