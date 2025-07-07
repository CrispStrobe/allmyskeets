// components/Skeet.tsx
import { type AppBskyEmbedImages, type AppBskyFeedDefs } from '@atproto/api';
import Image from 'next/image';
import { Heart, Repeat, MessageCircle } from 'lucide-react';

type PostView = AppBskyFeedDefs.PostView;

const Stat = ({ icon: Icon, count }: { icon: React.ElementType, count: number }) => (
  <div className="flex items-center gap-1.5 text-gray-500">
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{count > 0 ? count : 0}</span>
  </div>
);

export default function Skeet({
  post,
  isReply = false,
  hideMedia = false,
}: {
  post: PostView;
  isReply?: boolean;
  hideMedia?: boolean;
}) {
  const record = post.record as any;
  const embed = post.embed;

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${isReply ? 'ml-8' : ''}`}>
      <p className="text-gray-800 whitespace-pre-wrap">{record.text}</p>

      {!hideMedia && embed && (
        <div className="mt-3">
          {embed.$type === 'app.bsky.embed.images#view' && (
            <div className="grid grid-cols-2 gap-2">
              {(embed as AppBskyEmbedImages.View).images.map(image => (
                <div key={image.fullsize} className="relative aspect-video">
                  <Image
                    src={image.thumb}
                    alt={image.alt}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-5">
            <Stat icon={MessageCircle} count={post.replyCount ?? 0} />
            <Stat icon={Repeat} count={post.repostCount ?? 0} />
            <Stat icon={Heart} count={post.likeCount ?? 0} />
        </div>
        <p className="text-sm text-gray-400">
          {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}