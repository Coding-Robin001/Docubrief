"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SummariesGrid from "./summariesGrid";
import DeleteSummaryModal from "./deleteSummaryModal";
import type { SummaryCardData } from "./summaryCard";
import { deleteSummary } from "@/actions/summary-actions";

export default function SummariesDashboardClient({
  initialSummaries,
}: {
  initialSummaries: SummaryCardData[];
}) {
  const router = useRouter();
  const [summaries, setSummaries] = useState(initialSummaries);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // card's delete icon no longer deletes directly — it just opens
  // the confirmation modal
  const requestDelete = (id: string) => {
    setPendingId(id);
    setDeleteError(null);
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setPendingId(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteSummary(pendingId);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setSummaries((prev) => prev.filter((s) => s.id !== pendingId));
      setPendingId(null);
      // the server action already called revalidatePath — this just
      // tells this client to pick up the now-fresh server data too
      router.refresh();
    } catch (err) {
      console.error("deleteSummary call failed:", err);
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SummariesGrid summaries={summaries} onDelete={requestDelete} />
      <DeleteSummaryModal
        isOpen={pendingId !== null}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}