export default function SummaryCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 animate-pulse">
      {/* Top Header Section */}
      <div className="flex items-start gap-3 pr-8">
        {/* Icon box placeholder */}
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />
        
        {/* Title and date placeholders */}
        <div className="min-w-0 flex-1 space-y-2 py-0.5">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-200" />
        </div>
      </div>

      {/* Excerpt Body Placeholders */}
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-gray-200" />
        <div className="h-3.5 w-2/3 rounded bg-gray-200" />
      </div>

      {/* Status Badge Placeholder */}
      <div className="mt-5">
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}