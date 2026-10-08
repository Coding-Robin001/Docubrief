"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const slides = [
  {
    tag: "Quick overview",
    title: "What this document is about",
    body: "A comprehensive breakdown of the material, covering everything from the core fundamentals to the more advanced ideas.",
  },
  {
    tag: "Key point",
    title: "The number that matters most",
    body: "34% improvement over the baseline — the figure the rest of the document builds its case around.",
  },
  {
    tag: "Method",
    title: "How they got there",
    body: "An 18-month study across 40 sites, cross-checked against independent records.",
  },
  {
    tag: "Worth noting",
    title: "Where it could be wrong",
    body: "One key assumption isn't modeled past next year — worth double-checking before you cite it.",
  },
  {
    tag: "Takeaway",
    title: "What to actually do with this",
    body: "Solid enough to act on, with one dependency worth verifying first.",
  },
  {
    tag: "Takeaway",
    title: "What to actually do with this",
    body: "Solid enough to act on, with one dependency worth verifying first.",
  },
  {
    tag: "Worth noting",
    title: "Where it could be wrong",
    body: "One key assumption isn't modeled past next year — worth double-checking before you cite it.",
  },
  {
    tag: "Key point",
    title: "The number that matters most",
    body: "34% improvement over the baseline — the figure the rest of the document builds its case around.",
  }
];

// entrance, on scroll — this section is below the fold so it
// shouldn't animate until it's actually in view
const headVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

// directional swap between slides — the actual card content
// slides out one way and the new content slides in from the other
const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

export default function QuickOverviewSection() {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const touchStartX = useRef<number | null>(null);

  const paginate = (dir: number) => {
    setState([(index + dir + slides.length) % slides.length, dir]);
  };

  const goToDot = (i: number) => {
    if (i === index) return;
    setState([i, i > index ? 1 : -1]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      paginate(delta > 0 ? -1 : 1);
    }
    touchStartX.current = null;
  };

  const slide = slides[index];

  return (
    <section className="bg-[var(--color-bg-soft)] font-body">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <motion.div
          className="mx-auto max-w-xl text-center"
          variants={headVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--color-forest)]"
          >
            <Sparkles size={13} />
            Powered by AI
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display mt-5 text-[2rem] leading-tight tracking-tight text-[var(--color-ink)] sm:text-[2.5rem]"
          >
            See the reel, not the report
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg leading-relaxed text-[var(--color-ink-soft)]"
          >
            Every summary is a short stack of cards. Click through or
            swipe on mobile to see important points.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mx-auto mt-14 max-w-sm select-none md:max-w-[500px]"
          variants={cardEntrance}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-7 shadow-[0_30px_60px_-25px_rgba(18,36,29,0.3)]">
            {/* progress segments */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= index
                      ? "bg-[var(--color-forest)]"
                      : "bg-[var(--color-border)]"
                  }`}
                />
              ))}
            </div>

            <div className="relative mt-7 min-h-[320px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="inline-flex items-center rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-moss)]">
                    {slide.tag}
                  </span>
                  <h3 className="font-display mt-4 text-xl leading-snug text-[var(--color-ink)]">
                    {slide.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
                    {slide.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => paginate(-1)}
                aria-label="Previous card"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-moss)]"
              >
                <ChevronLeft size={18} />
              </motion.button>

              <span className="text-xs text-[var(--color-ink-soft)]">
                {index + 1} / {slides.length}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => paginate(1)}
                aria-label="Next card"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--color-forest)] text-white transition-colors hover:bg-[var(--color-forest-dark)]"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>

          {/* dot pagination beneath the card */}
          <div className="mt-6 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToDot(i)}
                aria-label={`Go to card ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 bg-[var(--color-forest)]"
                    : "w-1.5 bg-[var(--color-border)]"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}