
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";

type Resource = {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
};

type Reservation = {
  id: string;
  resourceId: string;
  reservedBy: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
};

export default function EditReservationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-slate-500">
          Loading edit form...
        </main>
      }
    >
      <EditReservationContent />
    </Suspense>
  );
}

function EditReservationContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [resources, setResources] = useState<Resource[]>([]);
  const [reservedBy, setReservedBy] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [reservationResponse, resourcesResponse] = await Promise.all([
          fetch(`/api/reservations/${id}`),
          fetch("/api/resources"),
        ]);

        const reservationResult = await reservationResponse.json();
        const resourcesResult = await resourcesResponse.json();

        if (!reservationResponse.ok) {
          setError(
            reservationResult.message || "Unable to load reservation."
          );
          return;
        }

        if (!resourcesResponse.ok) {
          setError(resourcesResult.message || "Unable to load resources.");
          return;
        }

        const reservation: Reservation =
          reservationResult.reservation;

        if (reservation.status === "CANCELLED") {
          setError("Cancelled reservations cannot be edited.");
          return;
        }

        const resourceList: Resource[] = resourcesResult.resources ?? [];

        setResources(
          resourceList.filter(
            (resource) =>
              resource.isActive || resource.id === reservation.resourceId
          )
        );
        setResourceId(reservation.resourceId);
        setReservedBy(reservation.reservedBy);
        setPurpose(reservation.purpose);
        setStartTime(toDateTimeLocal(reservation.startTime));
        setEndTime(toDateTimeLocal(reservation.endTime));
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!resourceId || !reservedBy.trim() || !purpose.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!startTime || !endTime || startTime >= endTime) {
      setError("The end time must be after the start time.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          reservedBy: reservedBy.trim(),
          purpose: purpose.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update reservation.");
        return;
      }

      router.push("/reservations");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-slate-500">
        Loading reservation...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-5 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/reservations"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to reservations
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit reservation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Update booking details and check resource availability.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        >
          <div>
            <label htmlFor="resourceId" className="text-sm font-medium">
              Resource *
            </label>
            <select
              id="resourceId"
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select a resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.category})
                  {!resource.isActive ? " — Inactive" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reservedBy" className="text-sm font-medium">
              Reserved by *
            </label>
            <input
              id="reservedBy"
              value={reservedBy}
              onChange={(event) => setReservedBy(event.target.value)}
              className={inputClass}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="purpose" className="text-sm font-medium">
              Purpose *
            </label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className={inputClass}
              rows={3}
              maxLength={300}
              required
            />
          </div>

          <div>
            <label htmlFor="startTime" className="text-sm font-medium">
              Start time *
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="text-sm font-medium">
              End time *
            </label>
            <input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={inputClass}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/reservations"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving || Boolean(error)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
