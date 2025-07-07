// app/api/search-actors/route.ts
import { getAuthenticatedAgent } from '@/lib/bsky-agent';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { term } = await request.json();

    if (!term) {
      // Return an empty array if the term is empty
      return NextResponse.json({ actors: [] });
    }

    const agent = await getAuthenticatedAgent();
    const response = await agent.api.app.bsky.actor.searchActors({
      term: term,
      limit: 8, // Limit to 8 suggestions
    });

    if (!response.data) {
      return NextResponse.json({ error: 'Failed to fetch actors' }, { status: 500 });
    }

    // Return the list of found actors
    return NextResponse.json({ actors: response.data.actors });

  } catch (error) {
    const e = error as Error;
    console.error('Actor Search API Route Error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}