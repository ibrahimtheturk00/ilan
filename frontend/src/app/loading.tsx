export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-44 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/50 mb-8" />

      {/* Filter Dock Skeleton */}
      <div className="h-14 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/40 mb-6" />

      {/* Job Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="h-48 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/40 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
              <div className="h-6 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded mb-2" />
              <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
