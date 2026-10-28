
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelReservationButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancelReservation() {
    if (!window.confirm("Cancel this reservation?")) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel reservation.");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancelReservation}
        disabled={loading}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Cancel"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
