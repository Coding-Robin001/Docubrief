import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";
import { getSummaryById } from "@/actions/summary-actions";
import {
  parseSummary,
  countWords,
  estimateReadMinutes,
} from "@/lib/parseSummary";
import SummaryCarousel from "@/components/summariesDashboard/summaryCarousel";
import DownloadPdfButton from "@/components/summariesDashboard/downloadPdfButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getSummaryById(id);

  if (!result.success || !result.data.summaryText) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center font-sans dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Summary unavailable
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {result.success ? "Still processing this summary..." : result.message}
        </h1>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-slate-800"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const { summaryText, fileName, originalFileUrl, createdAt } = result.data;
  const { title, slides } = parseSummary(summaryText);
  const wordCount = countWords(summaryText);
  const readMinutes = estimateReadMinutes(wordCount);

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Navigation & Metadata Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-8 dark:border-slate-800/60">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
              AI Summary
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Calendar size={12} />
              {formatDate(createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Clock size={12} />
              {readMinutes} min read
            </span>
          </div>
        </div>

        {/* Title & Document Source Banner */}
        <div className="my-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FileText size={14} className="shrink-0" />
              <span className="shrink-0 font-medium">Source:</span>
              <span className="truncate font-mono font-medium text-slate-700 dark:text-slate-300" title={fileName}>
                {fileName}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <a
                href={originalFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <ExternalLink size={13} />
                View Original
              </a>
              <DownloadPdfButton
                title={title}
                slides={slides}
                fileName={fileName}
              />
            </div>
          </div>
        </div>

        {/* Main Presentation Container */}
        <div className="mt-8">
          <SummaryCarousel slides={slides} />
        </div>

        <p className="mt-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
          {wordCount.toLocaleString()} words summarized across {slides.length} slides
        </p>
      </div>
    </main>
  );
}

          // <ChatTestButton summaryId={id}/>

