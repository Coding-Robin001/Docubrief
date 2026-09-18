"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadThing";
import { authClient } from "@/lib/auth-client";
import { generatePdfSummary } from "@/actions/upload-actions";

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const SUCCESS_TOAST_MS = 3000;
const COMPLETE_REDIRECT_MS = 1500;
const ERROR_TOAST_MS = 6000;

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", {
    message: "Invalid file format, PDFs only.",
  })
  .refine((file) => file.size <= MAX_SIZE_BYTES, {
    message: `That file is over ${MAX_SIZE_MB}MB — try a smaller PDF.`,
  });

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

// idle -> uploading -> success (brief) -> processing (AI summarizing)
// -> complete (redirects) | error (bounces back to idle)
type Phase =
  | "idle"
  | "uploading"
  | "success"
  | "processing"
  | "complete"
  | "error";

export default function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: session } = authClient.useSession();

  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onUploadBegin: () => {
      setProgress(0);
      setPhase("uploading");
    },
    onUploadProgress: (p) => {
      setProgress(p);
    },
    onClientUploadComplete: () => {
      setProgress(100);
      setPhase("success");
    },
    onUploadError: (uploadError) => {
      setError(uploadError.message);
      setProgress(0);
      setPhase("error");
    },
  });

  // success toast auto-advances to the "AI is working" toast, which
  // then hands off to generatePdfSummary in handleSubmit below
  useEffect(() => {
    if (phase === "success") {
      toastTimeout.current = setTimeout(() => {
        setPhase("processing");
      }, SUCCESS_TOAST_MS);
    }
    if (phase === "error") {
      toastTimeout.current = setTimeout(() => {
        setPhase("idle");
      }, ERROR_TOAST_MS);
    }
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const validateAndSetFile = (candidate: File | undefined | null) => {
    if (!candidate) return;

    const result = fileSchema.safeParse(candidate);
    if (!result.success) {
      setError(
        result.error.issues[0]?.message ?? "That file couldn't be used.",
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setProgress(0);
    setPhase("idle");
    setFile(candidate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading || (phase !== "idle" && phase !== "error")) return;
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (isUploading || (phase !== "idle" && phase !== "error")) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    if (isUploading) return;
    setFile(null);
    setError(null);
    setProgress(0);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  // this is the part that can take a while (server-side model calls,
  // retries, fallbacks) — errors here get their own clean toast
  // instead of the inline banner, since the person may have scrolled
  // or looked away while it was working
  const runSummaryGeneration = async (
    uploadResponse?: Parameters<typeof generatePdfSummary>[0],
  ) => {
    if (!uploadResponse) return;

    try {
      const result = await generatePdfSummary(uploadResponse);

      if (!result?.data) {
        setError(result?.message ?? "Failed to generate summary. Please try again.");
        setPhase("error");
        return;
      }

      setPhase("complete");

      // TODO: once generatePdfSummary persists the summary and returns
      // its id, swap this for the real field (e.g. result.id).
      const summaryId = (result as { id?: string }).id;
      setTimeout(() => {
        if (summaryId) {
          router.push(`/summary/${summaryId}`);
        }
      }, COMPLETE_REDIRECT_MS);
    } catch (err) {
      console.error("Summary generation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while summarizing your PDF. Please try again.",
      );
      setPhase("error");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Choose a PDF to upload first.");
      setPhase("error");
      return;
    }

    if (!session?.user) {
      setError("Please sign in before uploading a PDF.");
      setPhase("error");
      return;
    }

    setError(null);

    try {
      const response = await startUpload([file]);
      if (!response) {
        setError("Upload failed. Please try again.");
        setPhase("error");
        return;
      }
      // handoff to summary generation happens automatically once the
      // success toast finishes, via the effect above — but we still
      // need the upload response to pass along, so stash it there
      pendingUploadResponse.current = response;
    } catch (err) {
      console.error("Upload failed:", err);
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
      setPhase("error");
    }
  };

  const pendingUploadResponse = useRef<
    Parameters<typeof generatePdfSummary>[0] | undefined
  >(undefined);

  useEffect(() => {
    if (phase === "processing" && pendingUploadResponse.current) {
      void runSummaryGeneration(pendingUploadResponse.current);
      pendingUploadResponse.current = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isLocked =
    isUploading ||
    phase === "success" ||
    phase === "processing" ||
    phase === "complete";

  return (
    <>
      <div className="mt-12 rounded-3xl border border-[var(--color-border)] bg-white p-6 text-left shadow-[0_30px_60px_-25px_rgba(18,36,29,0.25)] sm:p-8">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-moss)]">
          Upload PDF
        </span>

        <label
          htmlFor="pdf-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            isLocked
              ? "cursor-default border-[var(--color-forest)] bg-[var(--color-bg-soft)]"
              : "cursor-pointer"
          } ${
            !isLocked && isDragging
              ? "border-[var(--color-forest)] bg-[var(--color-mist)]/40"
              : !isLocked && file
                ? "border-[var(--color-forest)] bg-[var(--color-bg-soft)]"
                : !isLocked
                  ? "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-moss)]"
                  : ""
          }`}
        >
          {isUploading ? (
            <>
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_-12px_rgba(18,36,29,0.3)]">
                <Loader2
                  size={22}
                  className="animate-spin text-[var(--color-forest)]"
                />
              </span>
              <span className="font-display mt-5 max-w-full truncate px-4 text-lg text-[var(--color-ink)]">
                {file?.name}
              </span>
              <span className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
                Uploading… {progress}%
              </span>
              <div className="mt-4 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-forest)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : file ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_-12px_rgba(18,36,29,0.3)]">
                <CheckCircle2
                  size={24}
                  className="text-[var(--color-forest)]"
                />
              </span>
              <span className="font-display mt-5 max-w-full truncate px-4 text-lg text-[var(--color-ink)]">
                {file.name}
              </span>
              <span className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
                {isLocked
                  ? "Uploaded"
                  : `${formatSize(file.size)} · ready to upload`}
              </span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    clearFile();
                  }}
                  className="mt-4 inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
                >
                  <X size={12} />
                  Remove
                </button>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

          <input
            ref={inputRef}
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={isLocked}
            onChange={handleInputChange}
          />
        </label>

        {error && phase !== "error" ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        ) : (
          !error && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
              <FileText size={13} />
              PDF only, up to {MAX_SIZE_MB}MB
            </div>
          )
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || isLocked}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-forest)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)] disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-ink-soft)]"
        >
          {isUploading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Uploading… {progress}%
            </>
          ) : (
            <>
              Upload your PDF
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-[var(--color-ink-soft)]">
          Your file is processed securely and never shared.
        </p>
      </div>

      {/* floating post-upload notifications */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <AnimatePresence mode="wait">
          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_20px_45px_-20px_rgba(18,36,29,0.35)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-mist)]/60">
                  <CheckCircle2
                    size={18}
                    className="text-[var(--color-forest)]"
                  />
                </span>
                <div>
                  <p className="font-display text-[15px] text-[var(--color-ink)]">
                    Upload complete
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">
                    Your PDF is safely uploaded.
                  </p>
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] bg-[var(--color-forest)]"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{
                  duration: SUCCESS_TOAST_MS / 1000,
                  ease: "linear",
                }}
              />
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-sm rounded-2xl bg-[var(--color-bg-deep)] p-4 shadow-[0_25px_50px_-20px_rgba(15,46,34,0.55)]"
            >
              <div className="flex items-start gap-3">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <motion.span
                    animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles
                      size={17}
                      className="text-[var(--color-highlight)]"
                    />
                  </motion.span>
                </span>
                <div>
                  <p className="font-display text-[15px] text-white">
                    AI is working its magic
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-mist)]">
                    Preparing your PDF review — hang tight.
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--color-highlight)]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          delay: i * 0.18,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--color-forest)] bg-[var(--color-bg-soft)] p-4 shadow-[0_20px_45px_-20px_rgba(18,36,29,0.35)]"
            >
              <div className="flex items-start gap-3">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)]"
                >
                  <CheckCircle2 size={18} className="text-white" />
                </motion.span>
                <div>
                  <p className="font-display text-[15px] text-[var(--color-ink)]">
                    Summary generated successfully
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">
                    Taking you to your reel…
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-red-200 bg-white p-4 shadow-[0_20px_45px_-20px_rgba(18,36,29,0.35)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle size={18} className="text-red-600" />
                </span>
                <div>
                  <p className="font-display text-[15px] text-[var(--color-ink)]">
                    Something went wrong
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">
                    {error ?? "Please try again."}
                  </p>
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] bg-red-400"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: ERROR_TOAST_MS / 1000, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}