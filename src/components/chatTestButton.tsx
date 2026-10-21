"use client";
 
// Drop <ChatTestButton summaryId={id} /> into the summary detail page.
import { useState } from "react";
import { askPdfQuestion } from "@/actions/chat-action";
 
export default function ChatTestButton({ summaryId }: { summaryId: string }) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
 
  const run = async () => {
    setLoading(true);
    setOutput("");
    const startedAt = Date.now();
 
    const result = await askPdfQuestion({
      summaryId,
      question: "3 key things to know about this documents?",
    });
 
    setOutput(`${Date.now() - startedAt}ms\n${JSON.stringify(result, null, 2)}`);
    setLoading(false);
  };
 
  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Asking…" : "Test chat action"}
      </button>
      <pre className="mt-3 whitespace-pre-wrap text-xs text-[var(--color-ink-soft)]">
        {output}
      </pre>
    </div>
  );
}