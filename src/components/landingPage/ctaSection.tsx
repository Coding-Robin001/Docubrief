"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-deep)] font-body">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(55% 60% at 15% 100%, var(--color-forest) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-28"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
      >
        <motion.h2
          variants={fadeUp}
          className="font-display mx-auto max-w-lg text-[2rem] leading-tight tracking-tight text-white sm:text-[2.5rem]"
        >
          Stop reading page one and giving up
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-[var(--color-mist)]"
        >
          Upload your first PDF and get a clear summary back in under a
          minute. No card required.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-9 flex justify-center">
          <Link
            href="/upload"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-highlight)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-highlight-soft)]"
          >
            Try Sommaire, it&apos;s free
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}