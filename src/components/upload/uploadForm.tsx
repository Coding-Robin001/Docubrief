import { UploadCloud, FileText, ArrowRight } from "lucide-react";

export default function UploadForm() {
  return (
    <div className="mt-12 rounded-3xl border border-[var(--color-border)] bg-white p-6 text-left shadow-[0_30px_60px_-25px_rgba(18,36,29,0.25)] sm:p-8">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-moss)]">
        Upload PDF
      </span>

      <label
        htmlFor="pdf-upload"
        className="group mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-soft)] px-6 py-14 text-center transition-colors hover:border-[var(--color-moss)]"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_-12px_rgba(18,36,29,0.3)] transition-transform group-hover:-translate-y-0.5">
          <UploadCloud size={24} className="text-[var(--color-forest)]" />
        </span>
        <span className="font-display mt-5 text-lg text-[var(--color-ink)]">
          Drag &amp; drop your PDF here
        </span>
        <span className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          or{" "}
          <span className="font-semibold text-[var(--color-forest)] underline underline-offset-2">
            browse your files
          </span>
        </span>
        <input id="pdf-upload" type="file" accept=".pdf" className="hidden" />
      </label>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
        <FileText size={13} />
        PDF only, up to 25MB
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-forest)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
      >
        Upload your PDF
        <ArrowRight size={17} />
      </button>

      <p className="mt-4 text-center text-xs text-[var(--color-ink-soft)]">
        Your file is processed securely and never shared.
      </p>
    </div>
  );
}