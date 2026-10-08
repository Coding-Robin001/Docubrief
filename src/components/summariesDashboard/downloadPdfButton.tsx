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

  // Safety fallback for non-ASCII characters
  const safeAscii = (text: string) => {
    return text.replace(/[^\x00-\x7F]/g, "");
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (heightNeeded: number) => {
        if (y + heightNeeded > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Title
      const cleanTitle = safeAscii(title);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(17, 24, 39);

      const titleLines: string[] = doc.splitTextToSize(cleanTitle, contentWidth);
      titleLines.forEach((line) => {
        ensureSpace(24);
        doc.text(line, margin, y);
        y += 24;
      });

      y += 10;

      // Divider Line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      // Slides Loop
      slides.forEach((slide) => {
        const cleanHeading = safeAscii(slide.heading);
        const validBullets = slide.bullets
          .map((b) => safeAscii(b))
          .filter(Boolean);

        if (!cleanHeading && validBullets.length === 0) return;

        ensureSpace(32);

        if (cleanHeading) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(31, 41, 55);
          doc.text(cleanHeading, margin, y);
          y += 18;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);

        const bulletIndent = 16;
        const textWidth = contentWidth - bulletIndent;

        validBullets.forEach((bulletText) => {
          const bulletLines: string[] = doc.splitTextToSize(bulletText, textWidth);
          const blockHeight = bulletLines.length * 14 + 6;

          ensureSpace(blockHeight);

          // Render clean SVG circle bullet instead of string dot
          doc.setFillColor(107, 114, 128);
          doc.circle(margin + 4, y - 3.5, 2, "F");

          bulletLines.forEach((line) => {
            doc.text(line, margin + bulletIndent, y);
            y += 14;
          });

          y += 4;
        });

        y += 12;
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