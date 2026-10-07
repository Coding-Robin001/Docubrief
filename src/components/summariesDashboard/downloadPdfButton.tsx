"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { SummarySlide } from "@/lib/parseSummary";

type DownloadPdfButtonProps = {
  title: string;
  slides: SummarySlide[];
  fileName: string;
};

export default function DownloadPdfButton({
  title,
  slides,
  fileName,
}: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 56;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (lineHeight: number) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const titleLines: string[] = doc.splitTextToSize(title, maxWidth);
      titleLines.forEach((line) => {
        ensureSpace(24);
        doc.text(line, margin, y);
        y += 24;
      });

      y += 10;

      slides.forEach((slide) => {
        ensureSpace(26);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(slide.heading, margin, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        slide.bullets.forEach((bullet) => {
          const bulletLines: string[] = doc.splitTextToSize(
            `•  ${bullet}`,
            maxWidth,
          );
          bulletLines.forEach((line) => {
            ensureSpace(16);
            doc.text(line, margin, y);
            y += 16;
          });
        });

        y += 14;
      });

      const safeName =
        fileName.replace(/\.pdf$/i, "").replace(/[^\w\- ]+/g, "") ||
        "summary";
      doc.save(`${safeName}-summary.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Couldn't generate the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-moss)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Preparing…
          </>
        ) : (
          <>
            <Download size={13} />
            Download Summary
          </>
        )}
      </button>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}