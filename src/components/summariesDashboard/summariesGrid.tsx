import { FileX2, UploadCloud } from "lucide-react";
import Link from "next/link";
import SummaryCard, { type SummaryCardData } from "./summaryCard";

type SummariesGridProps = {
  summaries: SummaryCardData[];
  onDelete: (id: string) => void;
};

export default function SummariesGrid({
  summaries,
  onDelete,
}: SummariesGridProps) {
  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-soft)] px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_-12px_rgba(18,36,29,0.3)]">
          <FileX2 size={22} className="text-[var(--color-moss)]" />
        </span>
        <h3 className="font-display mt-5 text-lg text-[var(--color-ink)]">
          No summaries yet
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-[var(--color-ink-soft)]">
          Upload your first PDF and it will show up here as a reel.
        </p>
        <Link
          href="/upload"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
        >
          <UploadCloud size={15} />
          Upload a PDF
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {summaries.map((summary) => (
        <SummaryCard key={summary.id} {...summary} onDelete={onDelete} />
      ))}
    </div>
  );
}