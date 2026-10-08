import SummaryCardSkeleton from "@/components/summariesDashboard/summaryCardSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] font-body">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 animate-pulse">
        {/* Page Header Skeleton */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            {/* Title Placeholder */}
            <div className="h-8 w-48 rounded-md bg-gray-200 sm:h-9 sm:w-56" />
            {/* Subtitle Placeholder */}
            <div className="h-4 w-72 rounded-md bg-gray-200 sm:w-96" />
          </div>

          {/* Upload Button Placeholder */}
          <div className="h-10 w-36 rounded-full bg-gray-200" />
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SummaryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}