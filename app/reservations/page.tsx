
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CalendarDays, Plus, Clock3, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CancelReservationButton from "./cancel-button";
import DeleteReservationButton from "./delete-button";

export default function ReservationsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f8fa] p-8 text-sm text-slate-500">
          Loading reservations...
        </main>
      }
    >
      <ReservationsContent />
    </Suspense>
  );
}

async function ReservationsContent() {
  await connection();

  const reservations = await prisma.reservation.findMany({
    include: {
      resource: {
        select: {
          name: true,
          category: true,
          location: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reservations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage resource bookings.
            </p>
          </div>

          <Link
            href="/reservations/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus size={17} />
            New reservation
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold">All reservations</h2>
            <span className="text-sm text-slate-500">
              {reservations.length} total
            </span>
          </div>

          {reservations.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto text-slate-400" size={34} />
              <h3 className="mt-4 font-medium">No reservations yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create a reservation to see it listed here.
              </p>
              <Link
                href="/reservations/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <Plus size={16} />
                Create reservation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Resource</th>
                    <th className="px-6 py-3 font-medium">Reserved by</th>
                    <th className="px-6 py-3 font-medium">Purpose</th>
                    <th className="px-6 py-3 font-medium">Start</th>
                    <th className="px-6 py-3 font-medium">End</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium">{reservation.resource.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {reservation.resource.category}
                          {reservation.resource.location
                            ? ` · ${reservation.resource.location}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">{reservation.reservedBy}</td>
                      <td className="max-w-56 px-6 py-4 text-slate-600">
                        {reservation.purpose}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {reservation.startTime.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {reservation.endTime.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            reservation.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          {reservation.status === "CONFIRMED" && (
                            <>
                              <Link
                                href={`/reservations/${reservation.id}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </Link>

                              <CancelReservationButton id={reservation.id} />
                            </>
                          )}

                          <DeleteReservationButton id={reservation.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={14} />
            Times are displayed using the server&apos;s locale settings.        </p>
      </div>
    </main>
  );
}
