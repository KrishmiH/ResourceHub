
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteReservationButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this reservation? This action cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to delete reservation.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={14} />
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="max-w-48 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
