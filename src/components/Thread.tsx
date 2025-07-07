// src/components/Thread.tsx
'use client';

import { type AppBskyFeedDefs } from '@atproto/api';
import Skeet from './Skeet';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

export interface ThreadView {
  post: FeedViewPost;
  replies?: ThreadView[]; // Replies are now also threads
}

interface ThreadProps {
  thread: ThreadView;
  hideMedia: boolean;
}

export default function Thread({ thread, hideMedia }: ThreadProps) {
  return (
    <div className="flex flex-col">
      {/* Render the current post */}
      <Skeet post={thread.post.post} hideMedia={hideMedia} />
      
      {/* If there are replies, render them indented */}
      {thread.replies && thread.replies.length > 0 && (
        <div className="pl-5 border-l-2 border-gray-200 ml-5 space-y-2 pt-2">
          {thread.replies.map(replyThread => (
            <Thread key={replyThread.post.post.uri} thread={replyThread} hideMedia={hideMedia} />
          ))}
        </div>
      )}
    </div>
  );
}