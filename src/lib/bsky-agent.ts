// lib/bsky-agent.ts
import { BskyAgent } from '@atproto/api';

// This is a singleton. We'll reuse the agent across requests.
const agent = new BskyAgent({
  service: 'https://bsky.social',
});

// A function to ensure the agent is logged in.
let loggedIn = false;
export async function getAuthenticatedAgent(): Promise<BskyAgent> {
  if (!loggedIn) {
    try {
      await agent.login({
        identifier: process.env.BLUESKY_HANDLE!,
        password: process.env.BLUESKY_APP_PASSWORD!,
      });
      loggedIn = true;
    } catch (error) {
      console.error("Failed to login to Bluesky:", error);
      // Depending on your error handling, you might want to throw
      // or handle this differently.
    }
  }
  return agent;
}