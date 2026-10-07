import Link from "next/link";
import { ArrowLeft, Sparkles, Calendar, Clock, FileText, ExternalLink } from "lucide-react";
import { getSummaryById } from "@/actions/summary-actions";
import { parseSummary, countWords, estimateReadMinutes } from "@/lib/parseSummary";
import SummaryCarousel from "@/components/summariesDashboard/summaryCarousel";
import DownloadPdfButton from "@/components/summariesDashboard/downloadPdfButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center font-body">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-moss)]">
          Summary unavailable
        </p>
        <h1 className="font-display mt-3 text-2xl text-[var(--color-ink)]">
          {result.success ? "Still processing this one" : result.message}
        </h1>
        <Link
          href="/summaries"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>
      </main>
    );
  }

  const { summaryText, fileName, originalFileUrl, createdAt } = result.data;
  const { title, slides } = parseSummary(summaryText);
  const wordCount = countWords(summaryText);
  const readMinutes = estimateReadMinutes(wordCount);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] font-body">
      <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        {/* top row: meta badges left, back link right */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-forest)]">
              <Sparkles size={12} />
              AI Summary
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] px-3 py-1.5 text-xs text-[var(--color-ink-soft)]">
              <Calendar size={12} />
              {formatDate(createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] px-3 py-1.5 text-xs text-[var(--color-ink-soft)]">
              <Clock size={12} />
              {readMinutes} min read
            </span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-forest)]"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>
        </div>

        {/* title */}
        <h1 className="font-display mt-8 text-[2rem] leading-tight tracking-tight text-[var(--color-ink)] sm:text-[2.5rem]">
          {title}
        </h1>

        {/* source + actions */}
        <div className="mt-5 flex flex-col items-center gap-4 border-b border-[var(--color-border)] pb-10 sm:flex-row sm:justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
            <FileText size={14} />
            Source: {fileName}
          </span>

          <div className="flex items-center gap-3">
            <a
              href={originalFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-moss)]"
            >
              <ExternalLink size={13} />
              View Original
            </a>
            <DownloadPdfButton title={title} slides={slides} fileName={fileName} />
          </div>
        </div>

        {/* word count, sitting quietly above the carousel */}
        <p className="mt-8 text-center text-xs text-[var(--color-ink-soft)]">
          {wordCount.toLocaleString()} words in this summary
        </p>

        <div className="mt-6">
          <SummaryCarousel slides={slides} />
        </div>
      </div>
    </main>
  );
}