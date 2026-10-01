import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

type PlanLimitBannerProps = {
  used: number;
  limit: number;
  planName?: string;
};

export default function PlanLimitBanner({
  used,
  limit,
  planName = "Basic",
}: PlanLimitBannerProps) {
  if (used < limit) return null;

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--color-highlight)]/40 bg-[var(--color-highlight-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
          <Zap size={15} className="text-[var(--color-forest)]" />
        </span>
        <p className="text-sm text-[var(--color-ink)]">
          You&apos;ve reached the limit of {limit} uploads on the{" "}
          {planName} plan.
        </p>
      </div>

      <Link
        href="/pricing"
        className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-[var(--color-forest)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)] sm:self-auto"
      >
        Upgrade to Pro
        <ArrowRight
          size={13}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}