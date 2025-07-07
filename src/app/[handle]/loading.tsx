// app/[handle]/loading.tsx

// A reusable skeleton block component
const SkeletonBlock = ({ className }: { className: string }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);

export default function Loading() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <SkeletonBlock className="h-6 w-48 mb-6" />
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-3">
                    <SkeletonBlock className="h-8 w-1/2" />
                    <SkeletonBlock className="h-6 w-1/3" />
                </div>
            </div>
             <div className="mt-4 space-y-2">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
            </div>
        </div>
      </div>

      {/* Controls Skeleton */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonBlock className="h-10 lg:col-span-2" />
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
         </div>
      </div>

      {/* Post Skeletons */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4">
                        <SkeletonBlock className="h-5 w-12" />
                        <SkeletonBlock className="h-5 w-12" />
                        <SkeletonBlock className="h-5 w-12" />
                    </div>
                    <SkeletonBlock className="h-4 w-24" />
                </div>
             </div>
        ))}
      </div>
    </main>
  );
}