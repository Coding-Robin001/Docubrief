import { Sparkles } from "lucide-react";

export default function UploadHeader() {
  return (
    <div className="text-center">
      <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--color-forest)]">
        <Sparkles size={13} />
        Powered by AI
      </div>

      <h1 className="font-display mt-6 text-[2.25rem] leading-[1.1] tracking-tight text-[var(--color-ink)] sm:text-5xl">
        Start uploading{" "}
        <span className="rounded-md bg-[var(--color-highlight-soft)] px-1.5 py-0.5">
          your PDFs
        </span>
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-soft)]">
        Drop in a document and let DocuBrief turn it into a short,
        skimmable reel.
      </p>
    </div>
  );
}