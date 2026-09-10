"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Layers, FileText } from "lucide-react";

// One shared easing/timing language for the whole sequence —
// deliberately just two variant shapes, reused everywhere, so the
// motion reads as one orchestrated moment rather than scattered effects.

const columnVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stackVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.35 },
  },
};

const cardPop: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

function HeroSection() {
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
        {/* Left: copy — headline, subtext, CTAs, note each animate in,
            one after another */}
        <motion.div
          className="text-left"
          variants={columnVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-[2.75rem] leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-6xl"
          >
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
                <motion.path
                  d="M2 7 C 30 2, 90 2, 118 7"
                  stroke="var(--color-highlight)"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-ink-soft)]"
          >
            Drop in any PDF and Sommaire pulls out what actually matters —
            a clear, skimmable summary in seconds, not a re-read.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
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
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]"
          >
            <Sparkles size={15} className="text-[var(--color-highlight)]" />
            No sign-up needed to try your first PDF
          </motion.div>
        </motion.div>

        {/* Right: the source PDF collapsing into a fanned reel of
            summary cards. Each layer pops in one at a time, starting
            once the headline has mostly settled. */}
        <motion.div
          className="relative mx-auto flex h-[440px] w-full max-w-sm items-center justify-center"
          variants={stackVariants}
          initial="hidden"
          animate="show"
        >
          {/* back sheet: the source PDF */}
          <motion.div
            variants={cardPop}
            className="absolute left-2 top-0 w-56 -rotate-[10deg] overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-[0_20px_40px_-18px_rgba(18,36,29,0.2)]"
          >
            <div
              className="absolute right-0 top-0 h-0 w-0"
              style={{
                borderStyle: "solid",
                borderWidth: "0 18px 18px 0",
                borderColor: `transparent var(--color-bg-soft) transparent transparent`,
              }}
            />
            <div className="p-5">
              <div className="mb-4 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-moss)]">
                <FileText size={12} />
                PDF
              </div>
              {[100, 90, 95, 60].map((w, i) => (
                <div
                  key={i}
                  className="mb-2 h-1.5 rounded-full bg-[var(--color-bg-soft)]"
                  style={{ width: `${w}%` }}
                />
              ))}
              <div className="relative my-2.5 h-1.5 w-[85%] rounded-full bg-[var(--color-bg-soft)]">
                <div className="absolute inset-y-[-2px] left-0 w-full rounded-full bg-[var(--color-highlight-soft)]" />
              </div>
              <div className="relative mb-2 h-1.5 w-[70%] rounded-full bg-[var(--color-bg-soft)]">
                <div className="absolute inset-y-[-2px] left-0 w-full rounded-full bg-[var(--color-highlight-soft)]" />
              </div>
              {[100, 40].map((w, i) => (
                <div
                  key={i}
                  className="mb-2 h-1.5 rounded-full bg-[var(--color-bg-soft)]"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* second card in the stack */}
          <motion.div
            variants={cardPop}
            className="absolute right-3 top-10 w-60 rotate-[7deg] overflow-hidden rounded-2xl border border-[var(--color-moss)]/30 bg-[var(--color-forest)] p-6 shadow-[0_20px_40px_-16px_rgba(15,46,34,0.45)]"
            style={{ height: "300px" }}
          >
            <FileText
              size={140}
              strokeWidth={1}
              className="absolute -bottom-6 -right-6 text-white/10"
            />
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Key point
            </span>
            <div className="font-display mt-4 text-lg leading-snug text-white/90">
              34% cost reduction
            </div>
            <div className="mt-3 h-1.5 w-[80%] rounded-full bg-white/15" />
            <div className="mt-2 h-1.5 w-[55%] rounded-full bg-white/15" />
          </motion.div>

          {/* front card: the resulting summary */}
          <motion.div
            variants={cardPop}
            className="absolute bottom-0 left-6 w-64 -rotate-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_30px_60px_-18px_rgba(15,46,34,0.4)]"
          >
            <div className="h-1.5 w-full bg-[var(--color-highlight)]" />
            <div className="p-6">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i === 0
                        ? "bg-[var(--color-forest)]"
                        : "bg-[var(--color-border)]"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-moss)]">
                Quick overview
              </div>
              <div className="font-display mt-2 mb-3 text-lg leading-snug text-[var(--color-ink)]">
                What this document is about
              </div>
              <div className="flex items-start gap-2 text-sm leading-snug text-[var(--color-ink-soft)]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-highlight)]" />
                Covers the three points that matter most, in plain language.
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-ink-soft)]">
                  1 / 9
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-forest)]">
                  <ArrowRight size={13} className="text-white" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* floating badge */}
          <motion.div
            variants={cardPop}
            className="absolute -right-2 bottom-6 flex items-center gap-1.5 rounded-full bg-[var(--color-forest)] px-3 py-1.5 text-xs font-medium text-white shadow-[0_10px_25px_-10px_rgba(15,46,34,0.5)]"
          >
            <Layers size={13} className="text-[var(--color-highlight)]" />
            9-card reel
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;