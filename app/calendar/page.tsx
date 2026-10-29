
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

type CalendarReservation = {
  id: string;
  reservedBy: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
  resource: {
    id: string;
    name: string;
    category: string;
    location: string | null;
  };
};

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(2000, 0, 1)
  );
  const [todayKey, setTodayKey] = useState("");
  const [calendarInitialized, setCalendarInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        const response = await fetch("/api/reservations/calendar");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load calendar reservations."
          );
        }

        setReservations(data.reservations);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load calendar reservations."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();

      setCurrentMonth(getMonthStart(now));
      setTodayKey(getDateKey(now));
      setCalendarInitialized(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const calendarDays = useMemo(() => {
    const firstDay = getMonthStart(currentMonth);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startOffset + 1;

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return null;
      }

      return new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        dayNumber
      );
    });
  }, [currentMonth]);

  const reservationsByDate = useMemo(() => {
    const grouped: Record<string, CalendarReservation[]> = {};

    for (const reservation of reservations) {
      const start = new Date(reservation.startTime);
      const end = new Date(reservation.endTime);

      // Show the reservation on every date it overlaps.
      const day = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );

      const lastDay = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );

      while (day <= lastDay) {
        const key = getDateKey(day);
        grouped[key] ??= [];
        grouped[key].push(reservation);
        day.setDate(day.getDate() + 1);
      }
    }

    return grouped;
  }, [reservations]);

  function changeMonth(amount: number) {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + amount,
          1
        )
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-5 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Reservation calendar
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View your reservations by date.
              </p>
            </div>
          </div>

          <Link
            href="/reservations/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
          >
            <Plus size={17} />
            New reservation
          </Link>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {formatMonth(currentMonth)}
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentMonth(getMonthStart(new Date()))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
                className="rounded-md border border-slate-200 p-2 hover:bg-slate-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
                className="rounded-md border border-slate-200 p-2 hover:bg-slate-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="px-1 py-3 text-center text-xs font-semibold text-slate-500 sm:px-3"
                >
                  {day}
                </div>
              )
            )}
          </div>

          {!calendarInitialized ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Initializing calendar...
            </div>
            ) : error ? (
            <div role="alert" className="p-8 text-center text-sm text-red-700">
              {error}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading reservations...
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-24 border-b border-r border-slate-100 bg-slate-50/60 sm:min-h-32"
                    />
                  );
                }

                const dateKey = getDateKey(date);
                const dayReservations = reservationsByDate[dateKey] ?? [];
                const isToday = dateKey === todayKey;

                return (
                  <div
                    key={dateKey}
                    className="min-h-24 border-b border-r border-slate-100 p-1.5 sm:min-h-32 sm:p-2"
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? "bg-blue-700 font-semibold text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="mt-1 space-y-1">
                      {dayReservations.slice(0, 3).map((reservation) => (
                        <Link
                          key={reservation.id}
                          href={`/reservations/${reservation.id}/edit`}
                          title={`${reservation.resource.name} — ${reservation.purpose}`}
                          className={`block truncate rounded px-1.5 py-1 text-left text-[10px] font-medium sm:text-xs ${
                            reservation.status === "CONFIRMED"
                              ? "bg-blue-50 text-blue-800 hover:bg-blue-100"
                              : "bg-slate-100 text-slate-500 line-through hover:bg-slate-200"
                          }`}
                        >
                          {new Date(reservation.startTime).toLocaleTimeString(
                            "en-US",
                            { hour: "numeric", minute: "2-digit" }
                          )}{" "}
                          {reservation.resource.name}
                        </Link>
                      ))}

                      {dayReservations.length > 3 && (
                        <p className="px-1 text-[10px] text-slate-500">
                          +{dayReservations.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-4 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:px-6">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-200" />
              Confirmed
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
              Cancelled
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
