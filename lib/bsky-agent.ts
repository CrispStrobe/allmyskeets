// src/lib/bsky-agent.ts
import { BskyAgent } from '@atproto/api';

const agent = new BskyAgent({
  service: 'https://bsky.social',
});

export async function getAuthenticatedAgent(): Promise<BskyAgent> {
  if (!agent.session) {
    console.log("No active session, logging in...");
    try {
      await agent.login({
        identifier: process.env.BLUESKY_HANDLE!,
        password: process.env.BLUESKY_APP_PASSWORD!,
      });
    } catch (error) {
      console.error("Failed to login to Bluesky:", error);
      throw new Error("Bluesky login failed. Check server credentials.");
    }
  }
  return agent;
}