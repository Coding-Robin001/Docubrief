import Link from "next/link";
import { ArrowLeft, Sparkles, Calendar, Clock, FileText, ExternalLink } from "lucide-react";
import { getSummaryById } from "@/actions/summary-actions";
import { parseSummary, countWords, estimateReadMinutes } from "@/lib/parseSummary";
import SummaryCarousel from "@/components/summariesDashboard/summaryCarousel";
import DownloadPdfButton from "@/components/summariesDashboard/downloadPdfButton";
import ChatDock, { AskPdfButton } from "@/components/summariesDashboard/chatDock";
import { getChatPanelData } from "@/lib/chatData";

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
  const [result, chatData] = await Promise.all([
    getSummaryById(id),
    getChatPanelData(id),
  ]);

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
    <ChatDock
      summaryId={id}
      docTitle={title}
      initialMessages={chatData.messages}
      quota={chatData.quota}
    >
      <main className="min-h-screen bg-[var(--color-bg)] font-body">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          
          {/* Top row: Meta badges left, Back link right */}
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
              href="/summaries"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-forest)]"
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </Link>
          </div>

          {/* Title & Source Section (Folds gracefully without squishing elements) */}
          <div className="mt-8 min-w-0">
            <h1 className="font-display text-[2rem] leading-tight tracking-tight text-[var(--color-ink)] sm:text-[2.5rem] break-words">
              {title}
            </h1>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
              <FileText size={14} className="shrink-0" />
              <span className="truncate">Source: {fileName}</span>
            </span>
          </div>

          {/* Prominent Descriptive Chat Banner Card */}
          <div className="mt-6 rounded-2xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-[var(--color-forest)]">
                <Sparkles size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  Have questions? Chat directly with this PDF
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                  Ask specific questions about the text, data, or takeaways.
                </p>
              </div>
            </div>
            <div className="shrink-0 self-end sm:self-center cursor-pointer">
              <AskPdfButton />
            </div>
          </div>

          {/* Document Secondary Actions Bar (View Original & Download) */}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-b border-[var(--color-border)] pb-8">
            <a
              href={originalFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-moss)] bg-white"
            >
              <ExternalLink size={13} />
              View Original
            </a>
            <div className="shrink-0">
              <DownloadPdfButton title={title} slides={slides} fileName={fileName} />
            </div>
          </div>

          {/* Word count & Carousel */}
          <p className="mt-8 text-center text-xs text-[var(--color-ink-soft)]">
            {wordCount.toLocaleString()} words in this summary
          </p>

          <div className="mt-6">
            <SummaryCarousel slides={slides} />
          </div>
        </div>
      </main>
    </ChatDock>
  );
}