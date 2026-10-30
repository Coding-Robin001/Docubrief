"use client";

// Rendered inside the docked panel in chatDock.tsx.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUp, Loader2, Sparkles, X, Zap } from "lucide-react";
import { askPdfQuestion } from "@/actions/chat-action";
import type { ChatMessageItem } from "@/lib/chatData";
import type { ChatQuota } from "@/lib/chatLimit";

const MAX_QUESTION_CHARS = 500; // matches the server action's limit

const SUGGESTIONS = [
  "What are the main takeaways?",
  "Explain the key terms simply",
  "What should I do with this information?",
];

export default function PdfChat({
  summaryId,
  docTitle,
  initialMessages,
  quota,
  open,
  onClose,
}: {
  summaryId: string;
  docTitle: string;
  initialMessages: ChatMessageItem[];
  quota: ChatQuota | null;
  open: boolean;
  onClose: () => void;
}) {
  // 1. Define the threshold once when the component mounts using useState
  const [animateStartIndex] = useState(initialMessages.length);
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null means unlimited (premium) or unknown (quota failed to load)
  const [remaining, setRemaining] = useState<number | null>(
    quota?.remaining ?? null,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // messages that were already saved when the page loaded don't animate in
  const animateFrom = useRef(initialMessages.length);

  const limit = quota?.limit ?? null;
  const showMeter = quota !== null && limit !== null;
  const limitReached = showMeter && remaining !== null && remaining <= 0;
  const used = showMeter && remaining !== null ? limit - remaining : 0;
  const canSend = input.trim().length > 0 && !pending && !limitReached;

  // keep the newest message in view, including when the panel is reopened
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, open]);

  // focus the box once the panel has slid in
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => textareaRef.current?.focus(), 380);
    return () => clearTimeout(timer);
  }, [open]);

  const submit = async (text: string) => {
    const question = text.trim();
    if (!question || pending || limitReached) return;

    setError(null);
    setPending(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Use crypto.randomUUID() for pure, unique ID generation
    const tempId = `pending-${crypto.randomUUID()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "USER", content: question },
    ]);

    try {
      const result = await askPdfQuestion({ summaryId, question });

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `answer-${crypto.randomUUID()}`,
            role: "ASSISTANT",
            content: result.answer,
          },
        ]);
        setRemaining(result.remaining);
      } else {
        // take the question back out and into the box so they can retry
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInput(question);
        setError(result.message);
        if (result.code === "LIMIT_REACHED") setRemaining(0);
      }
    } catch (err) {
      console.error("askPdfQuestion call failed:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(question);
      setError(
        "Couldn't reach the server. Your question wasn't counted. Try again.",
      );
    } finally {
      setPending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* header: title, document name, close */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)]">
            <Sparkles size={17} className="text-[var(--color-highlight)]" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[17px] leading-tight text-[var(--color-ink)]">
              Ask this PDF
            </h2>
            <p
              className="truncate text-xs text-[var(--color-ink-soft)]"
              title={docTitle}
            >
              {docTitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]"
        >
          <X size={18} />
        </button>
      </div>

      {/* daily allowance */}
      {showMeter && remaining !== null && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] px-5 py-2.5">
          <p className="text-xs font-medium text-[var(--color-ink)]">
            {limitReached
              ? `${limit} out of ${limit} questions used today`
              : `${remaining} out of ${limit} questions left today`}
          </p>
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: limit }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-5 rounded-full transition-colors ${
                  i < used
                    ? limitReached
                      ? "bg-[var(--color-highlight)]"
                      : "bg-[var(--color-forest)]"
                    : "bg-[var(--color-border)]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {quota !== null && limit === null && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] px-5 py-2.5">
          <p className="text-xs font-medium text-[var(--color-forest)]">
            Unlimited questions
          </p>
        </div>
      )}

      {/* conversation */}
      <div
        ref={scrollRef}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
      >
        {messages.length === 0 && !pending ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-mist)]/60">
              <Sparkles size={20} className="text-[var(--color-forest)]" />
            </span>
            <p className="font-display mt-4 text-lg text-[var(--color-ink)]">
              Ask anything about this PDF
            </p>
            <p className="mt-1 max-w-[16rem] text-sm text-[var(--color-ink-soft)]">
              If the document doesn&apos;t cover it, you&apos;ll be told rather
              than given a guess.
            </p>

            {!limitReached && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void submit(suggestion)}
                    className="rounded-full border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-[13px] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => {
              const isUser = message.role === "USER";

              return (
                <motion.div
                  key={message.id}
                  initial={
                    index >= animateStartIndex ? { opacity: 0, y: 8 } : false
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
                    isUser
                      ? "self-end rounded-br-md bg-[var(--color-forest)] text-white"
                      : "self-start rounded-bl-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-ink)]"
                  }`}
                >
                  {message.content}
                </motion.div>
              );
            })}

            {pending && (
              <div className="flex w-fit items-center gap-1.5 self-start rounded-2xl rounded-bl-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]"
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
            )}
          </div>
        )}
      </div>

      {/* footer: error, then the input or the limit-reached panel */}
      <div className="border-t border-[var(--color-border)] px-5 py-4">
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {limitReached ? (
          <div className="rounded-2xl border border-[var(--color-highlight)]/50 bg-[var(--color-highlight-soft)] px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                <Zap size={15} className="text-[var(--color-forest)]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  You&apos;ve used today&apos;s {limit} questions
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-ink)]/80">
                  They reset at midnight UTC, or upgrade for unlimited chat.
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="mt-3 flex w-full items-center justify-center rounded-full bg-[var(--color-forest)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-forest-dark)]"
            >
              Upgrade to premium
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2.5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={pending}
                rows={1}
                maxLength={MAX_QUESTION_CHARS}
                aria-label="Your question about this PDF"
                placeholder="What did they test this on?"
                className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-[14.5px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-soft)]/60 focus:border-[var(--color-moss)] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void submit(input)}
                disabled={!canSend}
                aria-label="Send question"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)] text-white transition-colors hover:bg-[var(--color-forest-dark)] disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-ink-soft)]"
              >
                {pending ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ArrowUp size={18} />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-ink-soft)]">
              <span>Enter to send · Shift+Enter for a new line</span>
              {input.length > 400 && (
                <span
                  className={
                    input.length >= MAX_QUESTION_CHARS ? "text-red-600" : ""
                  }
                >
                  {input.length}/{MAX_QUESTION_CHARS}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
