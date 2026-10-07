"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SummarySlide } from "@/lib/parseSummary";

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

export default function SummaryCarousel({ slides }: { slides: SummarySlide[] }) {
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
    <div className="mx-auto w-full max-w-2xl">
      <div
        className="relative select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* side nav arrows float outside the card on desktop */}
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] shadow-[0_10px_25px_-12px_rgba(18,36,29,0.35)] transition-colors hover:border-[var(--color-moss)] md:flex"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[var(--color-forest)] text-white shadow-[0_10px_25px_-12px_rgba(15,46,34,0.5)] transition-colors hover:bg-[var(--color-forest-dark)] md:flex"
        >
          <ChevronRight size={18} />
        </button>

        <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_35px_70px_-30px_rgba(18,36,29,0.3)]">
          {/* top bar: slide count left, forest progress rail right */}
          <div className="flex items-center justify-between gap-4 px-8 pt-6 sm:px-10">
            <span className="text-xs font-medium text-[var(--color-ink-soft)]">
              {index + 1} of {slides.length}
            </span>
            <div className="flex flex-1 gap-1.5">
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
          </div>

          <div className="relative min-h-[320px] overflow-hidden px-8 py-10 sm:px-14 sm:py-14">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[260px] flex-col justify-center text-center"
              >
                <span className="mx-auto inline-flex w-fit items-center rounded-full bg-[var(--color-bg-soft)] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-moss)]">
                  {slide.tag}
                </span>

                <h2 className="font-display mx-auto mt-5 max-w-md text-[1.6rem] leading-snug text-[var(--color-ink)] sm:text-[1.9rem]">
                  {slide.heading}
                </h2>

                <ul className="mx-auto mt-7 flex max-w-sm flex-col gap-4 text-left">
                  {slide.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="text-[15.5px] leading-relaxed text-[var(--color-ink-soft)]"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* mobile-only inline nav, since the floating arrows are hidden below md */}
          <div className="flex items-center justify-center gap-6 pb-7 md:hidden">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-ink)]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest)] text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* dot pagination */}
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-5 bg-[var(--color-forest)]"
                : "w-1.5 bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}