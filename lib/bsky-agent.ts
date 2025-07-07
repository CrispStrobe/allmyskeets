// src/lib/bsky-agent.ts
import { BskyAgent } from '@atproto/api';
// , AtpSessionData: not used for now

// This is a singleton. We'll reuse the agent across requests.
const agent = new BskyAgent({
  service: 'https://bsky.social',
  // You can optionally persist the session to a file or database
  // persistSession: (evt: string, session?: AtpSessionData) => {
  //   // TODO: Implement session storage
  // }
});

export async function getAuthenticatedAgent(): Promise<BskyAgent> {
  // Check if the agent already has session information
  if (!agent.session) {
    console.log("No active session, logging in...");
    try {
      await agent.login({
        identifier: process.env.BLUESKY_HANDLE!,
        password: process.env.BLUESKY_APP_PASSWORD!,
      });
    } catch (error) {
      console.error("Failed to login to Bluesky:", error);
      // Throw the error to be handled by the caller
      throw new Error("Bluesky login failed. Check server credentials.");
    }
  }
  return agent;
}