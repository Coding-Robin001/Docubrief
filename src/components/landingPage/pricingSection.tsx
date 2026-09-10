"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    tagline: "For occasional reading",
    price: "$9",
    featured: false,
    features: [
      "5 PDF summaries a month",
      "Standard processing speed",
      "Email support",
    ],
  },
  {
    name: "Pro",
    tagline: "For professionals and teams",
    price: "$19",
    featured: true,
    features: [
      "Unlimited PDF summaries",
      "Priority processing",
      "Markdown export",
      "24/7 priority support",
    ],
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

const cardsVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const planVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// the ribbon pops in a beat after its card has settled, with a
// little spring so it reads as a small extra moment, not part of
// the same fade
const ribbonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 18, delay: 0.35 },
  },
};

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-[var(--color-bg)] font-body">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <motion.div
          className="mx-auto max-w-xl"
          variants={headVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-[2rem] leading-tight tracking-tight text-[var(--color-ink)] sm:text-[2.5rem]"
          >
            Pick a plan when you&apos;re ready
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg leading-relaxed text-[var(--color-ink-soft)]"
          >
            Start with a free summary. Upgrade when you&apos;re doing this every
            day.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 grid h-[410px] max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2"
          variants={cardsVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={planVariants}
              className={`relative flex h-full flex-col rounded-2xl border p-8 ${
                plan.featured
                  ? "border-[var(--color-forest)] bg-[var(--color-bg-soft)]"
                  : "border-[var(--color-border)] bg-white"
              }`}
            >
              {plan.featured && (
                <motion.span
                  variants={ribbonVariants}
                  className="absolute -top-3 right-7 rounded-full bg-[var(--color-highlight)] px-3 py-1 text-[11px] font-semibold text-[var(--color-ink)]"
                >
                  Most chosen
                </motion.span>
              )}

              <h3 className="font-display text-lg text-[var(--color-ink)]">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                {plan.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl text-[var(--color-ink)]">
                  {plan.price}
                </span>
                <span className="text-sm text-[var(--color-ink-soft)]">
                  USD / month
                </span>
              </div>

              <ul className="mt-7 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--color-forest)]"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/upload"
                className={`mt-auto flex w-full items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold transition-colors ${
                  plan.featured
                    ? "bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-dark)]"
                    : "border border-[var(--color-border)] text-[var(--color-ink)] hover:border-[var(--color-moss)]"
                }`}
              >
                Buy now
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}