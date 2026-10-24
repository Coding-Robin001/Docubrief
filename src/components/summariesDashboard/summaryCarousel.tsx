"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Maximize2,
  X,
} from "lucide-react";
import type { SummarySlide } from "@/lib/parseSummary";

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 25 : -25 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -25 : 25 }),
};

// Explicitly typed as Variants
const bulletContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Explicitly typed as Variants
const bulletItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};
export default function SummaryCarousel({ slides }: { slides: SummarySlide[] }) {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const paginate = (dir: number) => {
    setState([(index + dir + slides.length) % slides.length, dir]);
  };

  const goToDot = (i: number) => {
    if (i === index) return;
    setState([i, i > index ? 1 : -1]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, slides.length, isFullscreen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) paginate(delta > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  const slide = slides[index];

  const renderSlideContent = () => (
    <AnimatePresence initial={false} custom={direction} mode="wait">
      <motion.div
        key={index}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center my-auto py-2"
      >
        {/* Category Tag */}
        <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-mist)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--color-moss)]">
          {slide.tag}
        </span>

        {/* Heading */}
        <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl leading-snug">
          {slide.heading}
        </h2>

        {/* Bullet Points */}
        <motion.div
          variants={bulletContainerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 w-full max-w-2xl flex flex-col gap-3 text-left"
        >
          {slide.bullets.map((bullet, i) => (
            <motion.div
              key={i}
              variants={bulletItemVariants}
              className="group relative flex items-start gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]/50 p-4 transition-colors hover:border-[var(--color-moss)] sm:p-4.5"
            >
              <span className="mt-2 flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-forest)] transition-transform group-hover:scale-125" />
              <p className="text-sm sm:text-[17px] leading-relaxed font-medium text-[var(--color-ink-soft)]">
                {bullet}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <div className="mx-auto w-full max-w-4xl select-none">
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl shadow-[var(--color-ink)]/5 h-[620px] sm:h-[640px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8 border-b border-[var(--color-border)] pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-mist)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-forest)]">
              <Sparkles size={12} className="text-[var(--color-moss)]" />
              Slide {index + 1} of {slides.length}
            </span>

            <div className="hidden sm:flex flex-1 max-w-[200px] gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToDot(i)}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= index ? "bg-[var(--color-forest)]" : "bg-[var(--color-mist)] hover:bg-[var(--color-moss)]"
                  }`}
                  aria-label={`Jump to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-soft)] bg-[var(--color-bg-soft)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg">
              <Command size={11} /> Use ← →
            </div>
          </div>

          {/* Fixed Scrollable Viewport */}
          <div className="relative flex-1 px-6 py-6 sm:px-10 overflow-y-auto custom-scrollbar flex flex-col">
            {renderSlideContent()}
          </div>

          {/* Controls */}
          <div className="flex shrink-0 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/80 px-6 py-4 sm:px-10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-ink)] shadow-xs transition-all hover:border-[var(--color-moss)] active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex sm:hidden items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToDot(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      i === index ? "w-6 bg-[var(--color-forest)]" : "w-2 bg-[var(--color-mist)]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] shadow-2xs hover:border-[var(--color-moss)] transition-colors"
              >
                <Maximize2 size={13} className="text-[var(--color-ink-soft)]" />
                Full Screen
              </button>
            </div>

            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next slide"
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-forest)] text-white shadow-xs transition-all hover:bg-[var(--color-forest-dark)] active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]/98 backdrop-blur-xl p-4 sm:p-8 select-none"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 max-w-5xl mx-auto w-full">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-mist)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-forest)]">
                <Sparkles size={12} className="text-[var(--color-moss)]" />
                Slide {index + 1} of {slides.length}
              </span>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs font-medium text-[var(--color-ink-soft)]">
                  Press ESC to exit
                </span>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-2 text-[var(--color-ink)] hover:bg-[var(--color-bg-soft)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-8 sm:px-20 max-w-4xl mx-auto w-full flex flex-col justify-center">
              {renderSlideContent()}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 max-w-5xl mx-auto w-full">
              <button
                type="button"
                onClick={() => paginate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-2xs hover:bg-[var(--color-bg-soft)]"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="text-xs font-semibold text-[var(--color-ink-soft)]">
                {index + 1} / {slides.length}
              </div>

              <button
                type="button"
                onClick={() => paginate(1)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-forest)] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-[var(--color-forest-dark)]"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}