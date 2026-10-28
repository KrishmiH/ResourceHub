
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  MapPin,
  Package,
  Plus,
  Pencil,
} from "lucide-react";

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-slate-500">
          Loading resources...
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}

async function ResourcesContent() {
  await connection();

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-5 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Resources
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View and manage your organization&apos;s shared resources.
            </p>
          </div>

          <Link
            href="/resources/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <Plus size={17} />
            Add resource
          </Link>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                All resources
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {resources.length} resource
                {resources.length === 1 ? "" : "s"} registered
              </p>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                <Package size={22} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No resources yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Start by adding a meeting room, laptop, or other shared resource.
              </p>

              <Link
                href="/resources/new"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800"
              >
                <Plus size={16} />
                Add your first resource
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Resource name</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {resource.name}
                        {resource.description && (
                          <p className="mt-1 max-w-xs truncate text-xs font-normal text-slate-500">
                            {resource.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {resource.category}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {resource.location || "Not specified"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            resource.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {resource.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/resources/${resource.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
