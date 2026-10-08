export default function UploadLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] font-body">
      {/* Background radial wash for continuity */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(55% 45% at 12% 8%, var(--color-mist) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6 pb-28 pt-24 md:pt-32 animate-pulse">
        {/* UploadHeader Skeleton */}
        <div className="text-center">
          {/* Badge Placeholder */}
          <div className="mx-auto h-7 w-32 rounded-full bg-gray-200" />

          {/* Heading Placeholder */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="h-9 w-3/4 rounded-md bg-gray-200 sm:h-12 sm:w-2/3" />
            <div className="h-9 w-1/2 rounded-md bg-gray-200 sm:h-12 sm:w-1/3" />
          </div>

          {/* Subtitle Placeholder */}
          <div className="mx-auto mt-4 h-5 w-5/6 rounded bg-gray-200 sm:w-3/4" />
        </div>

        {/* UploadForm Skeleton */}
        <div className="mt-12 rounded-3xl border border-[var(--color-border)] bg-white p-6 text-left shadow-[0_30px_60px_-25px_rgba(18,36,29,0.25)] sm:p-8">
          {/* Section Tag */}
          <div className="h-3.5 w-20 rounded bg-gray-200" />

          {/* Dropzone Container */}
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-soft)] px-6 py-14 text-center">
            {/* Icon Circle */}
            <div className="h-14 w-14 rounded-full bg-gray-200" />
            {/* Main Text Line */}
            <div className="mt-5 h-5 w-48 rounded bg-gray-200" />
            {/* Secondary Text Line */}
            <div className="mt-2 h-4 w-32 rounded bg-gray-200" />
          </div>

          {/* Subtext (PDF limit info) */}
          <div className="mt-4 h-3.5 w-36 rounded bg-gray-200" />

          {/* Submit Button Placeholder */}
          <div className="mt-6 h-12 w-full rounded-full bg-gray-200" />

          {/* Security Note Placeholder */}
          <div className="mx-auto mt-4 h-3 w-64 rounded bg-gray-200" />
        </div>

        {/* UploadFooter Skeleton */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}