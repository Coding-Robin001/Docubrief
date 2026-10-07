"use client";

import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";

export type SummaryStatus = "PENDING" | "COMPLETED" | "FAILED";

export type SummaryCardData = {
  id: string;
  title: string;
  excerpt: string;
  status: SummaryStatus;
  relativeTime: string;
};

const STATUS_STYLES: Record<
  SummaryStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  COMPLETED: {
    label: "Completed",
    dot: "bg-[var(--color-forest)]",
    bg: "bg-[var(--color-mist)]/50",
    text: "text-[var(--color-forest)]",
  },
  PENDING: {
    label: "Processing",
    dot: "bg-[var(--color-highlight)]",
    bg: "bg-[var(--color-highlight-soft)]",
    text: "text-[var(--color-ink)]",
  },
  FAILED: {
    label: "Failed",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-600",
  },
};

type SummaryCardProps = SummaryCardData & {
  onDelete: (id: string) => void;
};

export default function SummaryCard({
  id,
  title,
  excerpt,
  status,
  relativeTime,
  onDelete,
}: SummaryCardProps) {
  const statusStyle = STATUS_STYLES[status];
  const isPending = status === "PENDING";

  return (
    <Link
      href={isPending ? "#" : `/summaries/${id}`}
      aria-disabled={isPending}
      className={`group relative flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-moss)] hover:shadow-[0_20px_40px_-25px_rgba(18,36,29,0.4)] ${
        isPending ? "pointer-events-none opacity-80" : ""
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(id);
        }}
        aria-label="Delete summary"
        className="pointer-events-auto absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-soft)] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-soft)]">
          <FileText size={18} className="text-[var(--color-forest)]" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display truncate text-[15px] leading-tight text-[var(--color-ink)]">
            {title}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
            {relativeTime}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {excerpt}
      </p>

      <div className="mt-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </div>
    </Link>
  );
}