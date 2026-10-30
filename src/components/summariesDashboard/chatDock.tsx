"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PdfChat from "./pdfChat";
import type { ChatMessageItem } from "@/lib/chatData";
import type { ChatQuota } from "@/lib/chatLimit";

type DockContextValue = { open: boolean; toggle: () => void };

const ChatDockContext = createContext<DockContextValue | null>(null);

function useChatDock() {
  const context = useContext(ChatDockContext);
  if (!context) {
    throw new Error("AskPdfButton must be rendered inside <ChatDock>.");
  }
  return context;
}

/** The green "Ask this PDF" button for the page's banner card. */
export function AskPdfButton() {
  const { open, toggle } = useChatDock();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls="pdf-chat-panel"
      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-forest-dark)] shrink-0"
    >
      <Sparkles size={13} className="text-[var(--color-highlight)]" />
      Ask PDF
    </button>
  );
}

/**
 * Wrap the summary page in this. It pushes the page left when the chat is
 * open (on large screens; on small ones the panel overlays), docks the chat
 * on the right below the site header, and keeps the chat mounted while closed
 * so messages and half-typed questions survive closing and reopening.
 */
export default function ChatDock({
  summaryId,
  docTitle,
  initialMessages,
  quota,
  children,
}: {
  summaryId: string;
  docTitle: string;
  initialMessages: ChatMessageItem[];
  quota: ChatQuota | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);

  const toggle = useCallback(() => setOpen((value) => !value), []);
  const close = useCallback(() => setOpen(false), []);

  // Keep the panel just below the site header, until the header scrolls away
  // and the panel can use the full height of the screen.
  useEffect(() => {
    if (!open) return;

    const header = document.querySelector("header");
    const update = () =>
      setTop(
        header ? Math.max(0, Math.round(header.getBoundingClientRect().bottom)) : 0,
      );

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Escape closes the panel
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const contextValue = useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <ChatDockContext.Provider value={contextValue}>
      {/* the page itself: eases left to make room when the chat is open.
          420px here matches the panel's width below. */}
      <div
        className={`transition-[padding-right] duration-300 ease-out ${
          open ? "lg:pr-[420px]" : ""
        }`}
      >
        {children}
      </div>

      {/* dim the page behind the panel on screens where it overlays */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-[var(--color-ink)]/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* the docked panel. Always mounted so the conversation isn't lost. */}
      <motion.aside
        id="pdf-chat-panel"
        aria-label="Chat with this PDF"
        inert={!open}
        initial={false}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ top }}
        className={`fixed bottom-0 right-0 z-40 flex w-full flex-col border-l border-[var(--color-border)] bg-white sm:w-[420px] ${
          open ? "shadow-[-24px_0_48px_-32px_rgba(18,36,29,0.4)]" : ""
        }`}
      >
        <PdfChat
          summaryId={summaryId}
          docTitle={docTitle}
          initialMessages={initialMessages}
          quota={quota}
          open={open}
          onClose={close}
        />
      </motion.aside>
    </ChatDockContext.Provider>
  );
}