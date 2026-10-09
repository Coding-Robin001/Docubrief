import Link from "next/link";
import { UploadCloud, Zap } from "lucide-react";
import { fetchSummaries } from "@/actions/summary-actions";
import SummariesDashboardClient from "@/components/summariesDashboard/summariesDashboardClient";
import UploadQuotaMeter from "@/components/upload/uploadQuotaMeter";
import { getCurrentUserQuota } from "@/lib/uploadLimit";
import type { SummaryCardData } from "@/components/summariesDashboard/summaryCard";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString();
}

export default async function SummariesPage() {
  const [result, quota] = await Promise.all([
    fetchSummaries(),
    getCurrentUserQuota(),
  ]);

  const summaries: SummaryCardData[] = result.success
    ? result.data.map((s) => ({
        id: s.id,
        title: s.title ?? s.fileName.replace(/\.pdf$/i, ""),
        excerpt: s.excerpt ?? "No preview available yet.",
        status: s.status,
        relativeTime: formatRelativeTime(s.createdAt),
      }))
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] font-body">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[1.9rem] tracking-tight text-[var(--color-ink)] sm:text-[2.25rem]">
              Your Summaries
            </h1>
            <p className="text-[15px] text-[var(--color-ink-soft)]">
              Transform your PDFs into concise, actionable insights.
            </p>
          </div>

          {quota?.hasReachedLimit ? (
            <Link
              href="/pricing"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-highlight)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-highlight-soft)]"
            >
              <Zap size={15} />
              Upgrade to upload more
            </Link>
          ) : (
            <Link
              href="/upload"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
            >
              <UploadCloud size={15} />
              Upload a PDF
            </Link>
          )}
        </div>

        <UploadQuotaMeter quota={quota} className="mt-7" />

        {!result.success && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {result.message}
          </div>
        )}

        <div className="mt-8">
          <SummariesDashboardClient initialSummaries={summaries} />
        </div>
      </div>
    </main>
  );
}

// import Link from "next/link";
// import { UploadCloud } from "lucide-react";
// import { fetchSummaries } from "@/actions/summary-actions";
// import SummariesDashboardClient from "@/components/summariesDashboard/summariesDashboardClient";
// import type { SummaryCardData } from "@/components/summariesDashboard/summaryCard";

// function formatRelativeTime(date: Date): string {
//   const diffMs = Date.now() - new Date(date).getTime();
//   const diffSec = Math.floor(diffMs / 1000);
//   const diffMin = Math.floor(diffSec / 60);
//   const diffHr = Math.floor(diffMin / 60);
//   const diffDay = Math.floor(diffHr / 24);

//   if (diffSec < 60) return "Just now";
//   if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
//   if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
//   if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
//   return new Date(date).toLocaleDateString();
// }

// export default async function SummariesPage() {
//   const result = await fetchSummaries();

//   const summaries: SummaryCardData[] = result.success
//     ? result.data.map((s) => ({
//         id: s.id,
//         title: s.title ?? s.fileName.replace(/\.pdf$/i, ""),
//         excerpt: s.excerpt ?? "No preview available yet.",
//         status: s.status,
//         relativeTime: formatRelativeTime(s.createdAt),
//       }))
//     : [];

//   return (
//     <main className="min-h-screen bg-[var(--color-bg)] font-body">
//       <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
//         <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
//           <div className="flex flex-col gap-1">
//             <h1 className="font-display text-[1.9rem] tracking-tight text-[var(--color-ink)] sm:text-[2.25rem]">
//               Your Summaries
//             </h1>
//             <p className="text-[15px] text-[var(--color-ink-soft)]">
//               Transform your PDFs into concise, actionable insights.
//             </p>
//           </div>

//           <Link
//             href="/upload"
//             className="group inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
//           >
//             <UploadCloud size={15} />
//             Upload a PDF
//           </Link>
//         </div>

//         {!result.success && (
//           <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
//             {result.message}
//           </div>
//         )}

//         <div className="mt-8">
//           <SummariesDashboardClient initialSummaries={summaries} />
//         </div>
//       </div>
//     </main>
//   );
// }