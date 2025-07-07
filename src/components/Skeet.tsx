// src/components/Skeet.tsx
import { type AppBskyFeedDefs, AppBskyEmbedImages, AppBskyEmbedRecord,AppBskyEmbedExternal } from '@atproto/api';
import Image from 'next/image';
import { Heart, Repeat, MessageCircle } from 'lucide-react';
import QuotePostView from './QuotePostView';

type PostView = AppBskyFeedDefs.PostView;
type PostRecord = { text: string; createdAt: string; };

const Stat = ({ icon: Icon, count }: { icon: React.ElementType, count: number }) => (
  <div className="flex items-center gap-1.5 text-gray-500">
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{count > 0 ? count.toLocaleString() : 0}</span>
  </div>
);

export default function Skeet({ post, hideMedia = false }: { post: PostView; hideMedia?: boolean; }) {
  const record = post.record as PostRecord;
  const embed = post.embed;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <p className="text-gray-800 whitespace-pre-wrap">{record.text}</p>

      {!hideMedia && embed && (
        <div className="mt-3">
          {/* Check for Image embeds */}
          {AppBskyEmbedImages.isView(embed) && (
            <div className="grid grid-cols-2 gap-2">
              {embed.images.map(image => (
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

          {/* Check for Quote Post embeds */}
          {AppBskyEmbedRecord.isView(embed) && (
            <div>
              {AppBskyEmbedRecord.isViewRecord(embed.record) && <QuotePostView record={embed.record} />}
              {AppBskyEmbedRecord.isViewNotFound(embed.record) && <p className="text-sm text-gray-500 border rounded-lg p-3 mt-2">Quoted post not found.</p>}
              {AppBskyEmbedRecord.isViewBlocked(embed.record) && <p className="text-sm text-gray-500 border rounded-lg p-3 mt-2">Post from a blocked account.</p>}
            </div>
          )}
          
          {/* Check for External Link card embeds */}
          {AppBskyEmbedExternal.isView(embed) && (
             <a href={embed.external.uri} target="_blank" rel="noopener noreferrer" className="mt-2 block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
              {embed.external.thumb && (
                // Next.js prefers its own <Image /> component for optimization. However, for external link card thumbnails, the image can come from any domain, which we can't pre-configure. Therefore, using a standard <img> here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={embed.external.thumb} alt={embed.external.title} className="w-full h-32 object-cover" />
              )}
              <div className="p-3">
                <p className="text-xs text-gray-500">{new URL(embed.external.uri).hostname}</p>
                <p className="font-semibold text-gray-800">{embed.external.title}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{embed.external.description}</p>
              </div>
            </a>
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