// Place at: src/components/uploadPage/uploadQuotaMeter.tsx
// Used by both the upload page and the summaries dashboard.
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import type { UploadQuota } from "@/lib/uploadLimit";

export default function UploadQuotaMeter({
  quota,
  className = "",
}: {
  quota: UploadQuota | null;
  className?: string;
}) {
  // signed out, or premium (unlimited): nothing to show
  if (!quota || quota.limit === null) return null;

  const { used, limit, remaining, hasReachedLimit } = quota;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-5 gap-y-3 ${className}`}
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">
          {hasReachedLimit
            ? `${used} out of ${limit} uploads used`
            : `${remaining} out of ${limit} uploads remaining`}
        </p>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {Array.from({ length: limit }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < used
                  ? hasReachedLimit
                    ? "bg-[var(--color-highlight)]"
                    : "bg-[var(--color-forest)]"
                  : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </div>

      {hasReachedLimit && (
        <Link
          href="/pricing"
          className="group inline-flex max-w-xs items-center gap-2 rounded-2xl border border-[var(--color-highlight)]/50 bg-[var(--color-highlight-soft)] px-4 py-2.5 text-left text-xs font-semibold leading-snug text-[var(--color-ink)] transition-colors hover:border-[var(--color-highlight)]"
        >
          <Zap size={14} className="shrink-0 text-[var(--color-forest)]" />
          <span>Upgrade to premium to get unlimited uploads and summaries</span>
          <ArrowRight
            size={14}
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}