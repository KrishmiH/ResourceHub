
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";

type Resource = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
  isActive: boolean;
};

export default function EditResourcePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-slate-500">
          Loading edit form...
        </main>
      }
    >
      <EditResourceContent />
    </Suspense>
  );
}

function EditResourceContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [resource, setResource] = useState<Resource | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Meeting room");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResource() {
      try {
        const response = await fetch(`/api/resources/${id}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Resource could not be loaded.");
          return;
        }

        const item: Resource = result.resource;
        setResource(item);
        setName(item.name);
        setCategory(item.category);
        setDescription(item.description ?? "");
        setLocation(item.location ?? "");
        setIsActive(item.isActive);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    }

    loadResource();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          location: location.trim(),
          isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update resource.");
        return;
      }

      router.push("/resources");
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
        Loading resource...
      </main>
    );
  }

  if (!resource) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] p-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-red-600">
            {error || "Resource not found."}
          </p>
          <Link
            href="/resources"
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to resources
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-5 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/resources"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to resources
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit resource
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Update resource details and availability.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        >
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Resource name *
            </label>
            <input
              id="name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">
              Category *
            </label>
            <select
              id="category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="Meeting room">Meeting room</option>
              <option value="Laptop">Laptop</option>
              <option value="Equipment">Equipment</option>
              <option value="Projector">Projector</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <input
              id="location"
              maxLength={100}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-200 p-4">
            <div>
              <p className="text-sm font-medium">Resource status</p>
              <p className="mt-1 text-xs text-slate-500">
                Inactive resources should not be available for new bookings.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              Active
            </label>
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
              href="/resources"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
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
