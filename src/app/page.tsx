import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-bg)] font-body">
      {/* soft radial wash, kept quiet so it doesn't compete with the mark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 10%, var(--color-mist) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-20 md:grid-cols-2 md:pb-28 md:pt-28">
        {/* Left: copy */}
        <div className="text-left">
          <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-6xl">
            Read less.
            <br />
            Know{" "}
            <span className="relative inline-block">
              more.
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="10"
                viewBox="0 0 120 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 C 30 2, 90 2, 118 7"
                  stroke="var(--color-highlight)"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-ink-soft)]">
            Drop in any PDF and Sommaire pulls out what actually matters —
            a clear, skimmable summary in seconds, not a re-read.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/upload"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-forest)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
            >
              Try Sommaire
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-3.5 text-[15px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-moss)]"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <Sparkles size={15} className="text-[var(--color-highlight)]" />
            No sign-up needed to try your first PDF
          </div>
        </div>

        {/* Right: the literal transformation — a document getting
            highlighted, then collapsing into a summary card */}
        <div className="relative mx-auto flex h-[420px] w-full max-w-sm items-center justify-center">
          {/* back sheet: the source PDF, with highlight strokes */}
          <div className="absolute right-4 top-2 w-64 -rotate-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_40px_-15px_rgba(18,36,29,0.25)]">
            <div className="mb-4 h-2 w-16 rounded-full bg-[var(--color-mist)]" />
            {[100, 90, 95, 60].map((w, i) => (
              <div
                key={i}
                className="mb-2 h-2 rounded-full bg-[var(--color-bg-soft)]"
                style={{ width: `${w}%` }}
              />
            ))}
            <div className="relative my-3 h-2 w-[85%] rounded-full bg-[var(--color-bg-soft)]">
              <div className="absolute inset-y-[-3px] left-0 w-full rounded-full bg-[var(--color-highlight-soft)]" />
            </div>
            <div className="relative mb-2 h-2 w-[70%] rounded-full bg-[var(--color-bg-soft)]">
              <div className="absolute inset-y-[-3px] left-0 w-full rounded-full bg-[var(--color-highlight-soft)]" />
            </div>
            {[100, 40].map((w, i) => (
              <div
                key={i}
                className="mb-2 h-2 rounded-full bg-[var(--color-bg-soft)]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* front card: the resulting summary */}
          <div className="absolute left-2 bottom-4 w-64 rotate-3 rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[0_30px_60px_-20px_rgba(18,36,29,0.35)]">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-moss)]">
              Summary
            </div>
            <div className="font-display mb-3 text-lg text-[var(--color-ink)]">
              Quick overview
            </div>
            <div className="flex items-start gap-2 text-sm leading-snug text-[var(--color-ink-soft)]">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-highlight)]" />
              Covers the three points that matter most, in plain language.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}