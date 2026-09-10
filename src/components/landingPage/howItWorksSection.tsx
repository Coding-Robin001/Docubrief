"use client";

import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";
import { FileUp, ScanText, Rows3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "Upload PDF",
    description: "Simply drag and drop your PDF document, or click to upload.",
  },
  {
    icon: ScanText,
    title: "AI analysis",
    description: "Our AI reads the full document and works out what matters.",
  },
  {
    icon: Rows3,
    title: "Get summary",
    description: "Receive a clear, skimmable summary of your document.",
  },
];

const headVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// the row itself: staggering step → arrow → step → arrow → step means
// the whole thing reads left to right, one piece at a time
const rowVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const arrowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[var(--color-bg)] font-body">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <motion.div
          className="mx-auto max-w-xl text-center"
          variants={headVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          <motion.span
            variants={fadeUp}
            className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-moss)]"
          >
            How it works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-display mt-3 text-[2rem] leading-tight tracking-tight text-[var(--color-ink)] sm:text-[2.5rem]"
          >
            Transform any PDF into a clear summary in three simple steps
          </motion.h2>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 items-start gap-y-14 sm:grid-cols-[1fr_auto_1fr_auto_1fr]"
          variants={rowVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map(({ icon: Icon, title, description }, i) => (
            <Fragment key={title}>
              <motion.div
                variants={stepVariants}
                className="flex flex-col items-center text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)]">
                  <Icon size={26} className="text-[var(--color-forest)]" />
                </span>
                <h3 className="font-display mt-5 text-lg text-[var(--color-ink)]">
                  {title}
                </h3>
                <p className="mt-2 max-w-[24ch] text-[14.5px] leading-relaxed text-[var(--color-ink-soft)]">
                  {description}
                </p>
              </motion.div>

              {i < steps.length - 1 && (
                <motion.div
                  variants={arrowVariants}
                  className="hidden items-center justify-center pt-7 sm:flex"
                >
                  <ArrowRight size={20} className="text-[var(--color-border)]" />
                </motion.div>
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}