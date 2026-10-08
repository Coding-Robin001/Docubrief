"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { SummarySlide } from "@/lib/parseSummary";

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20 }),
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
    <div className="mx-auto w-full max-w-4xl">
      {/* Container height expanded significantly for maximum room */}
      <div
        className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-200/80 bg-white select-none shadow-xl h-[680px] sm:h-[620px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header Bar with increased padding */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-8 pt-8 sm:px-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
            <Sparkles size={13} className="text-emerald-600" />
            Slide {index + 1} of {slides.length}
          </span>

          <div className="flex flex-1 max-w-[220px] gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
                  i <= index ? "bg-emerald-600" : "bg-emerald-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Locked Content Stage with generous vertical padding */}
        <div className="relative flex-1 px-8 sm:px-12 overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="absolute inset-0 px-8 py-8 sm:px-12 sm:py-10 flex flex-col items-center text-center overflow-y-auto"
              style={{ willChange: "transform, opacity" }}
            >
              {/* Tag Pill */}
              <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                {slide.tag}
              </span>

              {/* Main Heading with mt-6 gap */}
              <h2 className="mt-6 shrink-0 w-full text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl leading-snug">
                {slide.heading}
              </h2>

              {/* Bullet Points Container with mt-8 and gap-4 */}
              <div className="mt-8 w-full flex flex-col gap-4 text-left">
                {slide.bullets.map((bullet, i) => (
                  <div
                    key={i}
                    className="relative flex items-start gap-4 rounded-2xl border border-emerald-100/90 bg-emerald-50/30 p-4 sm:p-5"
                  >
                    <span className="mt-2.5 flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                    <p className="text-[15px] sm:text-[16px] leading-relaxed font-medium text-slate-700">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Control Bar with py-6 spacing */}
        <div className="flex shrink-0 items-center justify-between border-t border-emerald-100 px-8 py-6 sm:px-12 bg-slate-50/60">
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="cursor-pointer flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-800 shadow-sm transition-transform active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToDot(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-200 ${
                  i === index ? "w-8 bg-emerald-600" : "w-2.5 bg-emerald-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="cursor-pointer flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition-transform active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}