
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function NewResourcePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Meeting room");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !category.trim()) {
      setError("Resource name and category are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          location: location.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to create resource.");
        return;
      }

      router.push("/resources");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
            Add resource
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Register a shared resource for your organization.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        >
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Resource name *
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Meeting Room A"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="text-sm font-medium text-slate-700"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
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
            <label
              htmlFor="location"
              className="text-sm font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              maxLength={100}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Floor 2, Building A"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add useful details about this resource..."
              className={inputClass}
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
              href="/resources"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isSubmitting ? "Saving..." : "Save resource"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
