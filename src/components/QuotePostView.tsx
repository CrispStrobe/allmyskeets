// src/components/QuotePostView.tsx
'use client';
import { type AppBskyEmbedRecord } from '@atproto/api'; // , type AppBskyFeedDefs omitted for now
import Image from 'next/image';

type ViewRecord = AppBskyEmbedRecord.ViewRecord;

export default function QuotePostView({ record }: { record: ViewRecord }) {
    const author = record.author;
    const postRecord = record.value as { text: string, createdAt: string };

    return (
        <div className="mt-2 p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
                <Image src={author.avatar ?? '/default-avatar.png'} alt={author.displayName ?? ''} width={16} height={16} className="w-4 h-4 rounded-full"/>
                <span className="font-semibold text-sm">{author.displayName}</span>
                <span className="text-gray-500 text-sm">@{author.handle}</span>
            </div>
            <p className="text-gray-800 text-sm whitespace-pre-wrap">{postRecord.text}</p>
        </div>
    );
}