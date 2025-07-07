// lib/export.ts
import { type AppBskyFeedDefs } from '@atproto/api';

type PostView = AppBskyFeedDefs.PostView;

// Helper function to trigger a file download in the browser
function triggerDownload(content: string, mimeType: string, fileName: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Exports an array of posts as a JSON file.
 * @param posts The array of posts to export.
 * @param handle The user handle, for the filename.
 */
export function exportAsJson(posts: PostView[], handle: string) {
    const dataStr = JSON.stringify({
        user: handle,
        exportDate: new Date().toISOString(),
        postCount: posts.length,
        posts: posts,
    }, null, 2);
    triggerDownload(dataStr, 'application/json', `skeets-${handle}-${Date.now()}.json`);
}

/**
 * Exports an array of posts as a CSV file.
 * @param posts The array of posts to export.
 * @param handle The user handle, for the filename.
 */
export function exportAsCsv(posts: PostView[], handle: string) {
    const headers = ['uri', 'text', 'likes', 'reposts', 'replies', 'createdAt'];
    
    // Function to safely handle CSV fields that might contain commas or quotes
    const escapeCsvField = (field: string | number): string => {
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = posts.map(post => {
        const record = post.record as any;
        return [
            post.uri,
            escapeCsvField(record.text),
            post.likeCount ?? 0,
            post.repostCount ?? 0,
            post.replyCount ?? 0,
            record.createdAt
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    triggerDownload(csvContent, 'text/csv;charset=utf-8;', `skeets-${handle}-${Date.now()}.csv`);
}