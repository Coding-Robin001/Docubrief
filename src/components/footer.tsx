"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles, FileText } from "lucide-react";

const footerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] font-body text-[var(--color-ink)]">
      {/* Soft background ambient gradient matching hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 100%, var(--color-mist) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
        <motion.div
          className="flex flex-col items-center justify-between gap-8 md:flex-row"
          variants={footerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Link
              href="/"
              className="group flex items-center gap-2 font-display text-xl tracking-tight text-[var(--color-ink)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-forest)] text-white shadow-sm transition-transform group-hover:scale-105">
                <FileText size={15} />
              </span>
              DocuBrief
            </Link>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Clear, skimmable summaries from any document in seconds.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-[var(--color-ink-soft)]">
            <Link
              href="/upload"
              className="transition-colors hover:text-[var(--color-forest)]"
            >
              Summarize
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-[var(--color-forest)]"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-[var(--color-forest)]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[var(--color-forest)]"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Social Links with inline SVGs */}
          <div className="flex items-center gap-4 text-[var(--color-ink-soft)]">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (formerly Twitter)"
              className="rounded-full border border-[var(--color-border)] p-2 transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-full border border-[var(--color-border)] p-2 transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)]/60 pt-6 text-xs text-[var(--color-ink-soft)] sm:flex-row">
          <p>© {currentYear} DocuBrief. All rights reserved.</p>
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles size={13} className="text-[var(--color-highlight)]" />
            <span>Built for faster reading</span>
          </div>
        </div>
      </div>
    </footer>
  );
}