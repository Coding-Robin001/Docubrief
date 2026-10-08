export default function SummaryDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] font-body">
      <div className="mx-auto max-w-4xl px-6 py-14 md:py-20 animate-pulse">
        {/* Top Row: Meta Badges Left, Back Link Right */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-7 w-24 rounded-full bg-gray-200" />
            <div className="h-7 w-32 rounded-full bg-gray-200" />
            <div className="h-7 w-28 rounded-full bg-gray-200" />
          </div>

          <div className="h-5 w-36 rounded bg-gray-200" />
        </div>

        {/* Title Placeholder */}
        <div className="mt-8 space-y-3">
          <div className="h-9 w-4/5 rounded-md bg-gray-200 sm:h-11 sm:w-3/4" />
          <div className="h-9 w-2/3 rounded-md bg-gray-200 sm:h-11 sm:w-1/2" />
        </div>

        {/* Source + Actions Section */}
        <div className="mt-5 flex flex-col items-center gap-4 border-b border-[var(--color-border)] pb-10 sm:flex-row sm:justify-between">
          {/* Source filename placeholder */}
          <div className="h-5 w-48 rounded bg-gray-200" />

          {/* Action buttons placeholders */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 rounded-full bg-gray-200" />
            <div className="h-9 w-36 rounded-full bg-gray-200" />
          </div>
        </div>

        {/* Word count placeholder */}
        <div className="mx-auto mt-8 h-4 w-40 rounded bg-gray-200" />

        {/* Carousel Skeleton Card */}
        <div className="mx-auto mt-6 w-full max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_35px_70px_-30px_rgba(18,36,29,0.3)]">
            {/* Top Bar (Progress Rail & Slide Counter) */}
            <div className="flex items-center justify-between gap-4 px-8 pt-6 sm:px-10">
              <div className="h-3 w-12 rounded bg-gray-200" />
              <div className="flex flex-1 gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-gray-200" />
                <div className="h-1 flex-1 rounded-full bg-gray-100" />
                <div className="h-1 flex-1 rounded-full bg-gray-100" />
                <div className="h-1 flex-1 rounded-full bg-gray-100" />
              </div>
            </div>

            {/* Slide Body */}
            <div className="flex min-h-[320px] flex-col justify-center px-8 py-10 sm:px-14 sm:py-14">
              {/* Tag placeholder */}
              <div className="mx-auto h-5 w-24 rounded-full bg-gray-200" />

              {/* Heading placeholder */}
              <div className="mx-auto mt-5 h-7 w-3/4 rounded-md bg-gray-200" />

              {/* Bullet points placeholder */}
              <div className="mx-auto mt-7 flex max-w-sm w-full flex-col gap-3">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
                <div className="h-4 w-4/5 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* Dots Pagination Placeholder */}
          <div className="mt-7 flex justify-center gap-2">
            <div className="h-1.5 w-5 rounded-full bg-gray-300" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </main>
  );
}