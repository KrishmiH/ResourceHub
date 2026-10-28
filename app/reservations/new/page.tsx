
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Save } from "lucide-react";

type Resource = {
  id: string;
  name: string;
  category: string;
  location: string | null;
  isActive: boolean;
};

export default function NewReservationPage() {
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceId, setResourceId] = useState("");
  const [reservedBy, setReservedBy] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loadingResources, setLoadingResources] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResources() {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load resources.");
        }

        const activeResources: Resource[] = data.resources.filter(
          (resource: Resource) => resource.isActive
        );

        setResources(activeResources);
        setResourceId(activeResources[0]?.id ?? "");
      } catch {
        setError("Unable to load resources. Please refresh the page.");
      } finally {
        setLoadingResources(false);
      }
    }

    loadResources();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (new Date(startTime) >= new Date(endTime)) {
      setError("The end time must be later than the start time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          reservedBy,
          purpose,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create reservation.");
      }

      router.push("/reservations");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/reservations"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to reservations
        </Link>

        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <CalendarDays size={23} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create reservation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Reserve an available resource for a specific time.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="resource">
              Resource
            </label>
            <select
              id="resource"
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              required
              disabled={loadingResources || resources.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="">
                {loadingResources
                  ? "Loading resources..."
                  : resources.length === 0
                    ? "No active resources available"
                    : "Select a resource"}
              </option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} — {resource.category}
                  {resource.location ? ` (${resource.location})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="reservedBy">
              Reserved by
            </label>
            <input
              id="reservedBy"
              value={reservedBy}
              onChange={(event) => setReservedBy(event.target.value)}
              maxLength={100}
              required
              placeholder="Enter the person's name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="purpose">
              Purpose
            </label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              maxLength={300}
              required
              rows={3}
              placeholder="Why is this resource needed?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="startTime">
                Start date and time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="endTime">
                End date and time
              </label>
              <input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/reservations"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || loadingResources || resources.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Create reservation"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
