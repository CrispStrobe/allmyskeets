// components/AnalyticsDashboard.tsx
'use client';
import { useMemo } from 'react';
import { type AppBskyFeedDefs } from '@atproto/api';
import { BarChart3, Heart, Repeat, MessageCircle, Clock, Calendar, TrendingUp, Star } from 'lucide-react';
import Skeet from './Skeet'; // We'll use this to display the top post

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

interface AnalyticsDashboardProps {
  feed: FeedViewPost[];
}

// A small component for displaying individual stats
const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <Icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-600">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
    </div>
);

export default function AnalyticsDashboard({ feed }: AnalyticsDashboardProps) {
    const analytics = useMemo(() => {
        if (!feed.length) return null;

        const totalLikes = feed.reduce((sum, item) => sum + (item.post.likeCount ?? 0), 0);
        const totalReposts = feed.reduce((sum, item) => sum + (item.post.repostCount ?? 0), 0);
        
        const topPostByLikes = [...feed].sort((a, b) => (b.post.likeCount ?? 0) - (a.post.likeCount ?? 0))[0];

        const postsByHour: number[] = Array(24).fill(0);
        feed.forEach(item => {
            const hour = new Date(item.post.indexedAt).getHours();
            postsByHour[hour]++;
        });

        return {
            totalPosts: feed.length,
            totalLikes,
            totalReposts,
            avgLikes: (totalLikes / feed.length).toFixed(1),
            avgReposts: (totalReposts / feed.length).toFixed(1),
            topPostByLikes,
            postsByHour,
        };
    }, [feed]);

    if (!analytics) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Not Enough Data</h3>
              <p className="text-gray-500">Load some posts to generate analytics.</p>
            </div>
        );
    }
    
    const maxHourlyPosts = Math.max(...analytics.postsByHour);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
            </h2>

            {/* --- Key Metrics --- */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Loaded Posts" value={analytics.totalPosts} icon={MessageCircle} />
                <StatCard title="Total Likes" value={analytics.totalLikes.toLocaleString()} icon={Heart} />
                <StatCard title="Total Reposts" value={analytics.totalReposts.toLocaleString()} icon={Repeat} />
                <StatCard title="Avg. Likes" value={analytics.avgLikes} icon={TrendingUp} />
                <StatCard title="Avg. Reposts" value={analytics.avgReposts} icon={TrendingUp} />
            </div>

            {/* --- Posting Activity By Hour --- */}
            <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Clock className="w-5 h-5"/>Posting Activity by Hour (Local Time)</h3>
                <div className="flex items-end justify-between gap-1 h-32 bg-gray-50 p-4 rounded-lg">
                    {analytics.postsByHour.map((count, hour) => (
                        <div key={hour} className="flex-1 flex flex-col items-center justify-end group">
                            <div 
                                className="w-full bg-blue-200 hover:bg-blue-400 transition-all" 
                                style={{ height: `${count > 0 ? (count / maxHourlyPosts) * 100 : 1}%` }}
                                title={`${count} posts at ${hour}:00`}
                            ></div>
                            <span className="text-xs text-gray-400 mt-1">{hour % 6 === 0 ? hour : ''}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Top Post --- */}
            <div>
                 <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Star className="w-5 h-5"/>Top Post by Likes</h3>
                 <Skeet post={analytics.topPostByLikes.post} />
            </div>
        </div>
    );
}