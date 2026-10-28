import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  Clock3,
  MapPin,
  ChevronRight,
  Filter,
  CalendarCheck,
  Building2,
  Laptop,
  Monitor,
} from "lucide-react";

const stats = [
  {
    label: "Total resources",
    value: "0",
    note: "Registered in the system",
    icon: Package,
  },
  {
    label: "Today's reservations",
    value: "0",
    note: "Scheduled for today",
    icon: CalendarDays,
  },
  {
    label: "Upcoming reservations",
    value: "0",
    note: "Confirmed bookings",
    icon: CalendarCheck,
  },
  {
    label: "Available resources",
    value: "0",
    note: "Ready to be reserved",
    icon: Building2,
  },
];

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Resources", href: "/resources", icon: Package },
  { label: "Reservations", href: "/reservations", icon: CalendarDays },
];

const resourceTypes = [
  { label: "Meeting rooms", icon: Building2 },
  { label: "Laptops", icon: Laptop },
  { label: "Equipment", icon: Monitor },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="flex h-[72px] items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Package size={20} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                ResourceHub
              </h1>
              <p className="text-[11px] text-slate-500">
                Resource management
              </p>
            </div>
          </div>

          <div className="px-3 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === "Dashboard";

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {item.label}
                    {item.label === "Reservations" && (
                      <span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        0
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Preferences
            </p>

            <button
              type="button"
              disabled
              title="Settings will be available in a future update"
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400"
            >
              <Settings size={18} strokeWidth={1.8} />
              Settings
              <span className="ml-auto text-[10px]">Soon</span>
            </button>
          </div>

          <div className="mt-auto border-t border-slate-200 p-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">
                Need assistance?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Resource management made simple.
              </p>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-400">
              ResourceHub · v1.0
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Top header */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
            <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white md:hidden">
                  <Package size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Workspace / Dashboard
                  </p>
                  <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                    Dashboard
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden lg:block">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    placeholder="Search..."
                    aria-label="Search"
                    className="h-9 w-52 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  aria-label="Notifications"
                  title="Notifications"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                >
                  <Bell size={18} strokeWidth={1.8} />
                </button>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  RH
                </div>
              </div>
            </div>

            {/* Mobile navigation */}
            <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === "Dashboard";

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {/* Dashboard body */}
          <div className="mx-auto max-w-[1440px] space-y-7 p-5 sm:p-8">
            {/* Page introduction */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  Workspace overview
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor your resources and manage reservations.
                </p>
              </div>

              <Link
                href="/reservations/new"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus size={17} />
                New reservation
              </Link>
            </section>

            {/* Summary cards */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Overview
                </h3>
                <span className="text-xs text-slate-500">
                  All resources
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">
                          {stat.label}
                        </p>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          <Icon size={18} strokeWidth={1.8} />
                        </div>
                      </div>

                      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                        {stat.value}
                      </p>

                      <p className="mt-1.5 text-xs text-slate-500">
                        {stat.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reservations section */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recent reservations
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Review resource bookings and their current status.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    title="Reservation filtering will be available when reservations are implemented"
                    className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-400"
                  >
                    <Filter size={15} />
                    Filter
                  </button>

                  <Link
                    href="/reservations"
                    className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    View all
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Table header */}
              <div className="hidden grid-cols-[1.5fr_1.2fr_1fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 md:grid">
                <p className="text-xs font-medium text-slate-500">
                  Resource
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Reserved by
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Date & time
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Status
                </p>
              </div>

              {/* Empty state */}
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                  <CalendarDays size={22} strokeWidth={1.6} />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-slate-800">
                  No reservations yet
                </h4>

                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Reservations will appear here when someone books a resource.
                  Create your first reservation to get started.
                </p>

                <Link
                  href="/reservations/new"
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Create reservation
                </Link>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Reservation data will be displayed here once booking
                  functionality is connected.
                </p>
              </div>
            </section>

            {/* Resource categories */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Resource categories
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Types of resources you can manage.
                  </p>
                </div>

                <Link
                  href="/resources"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  Manage resources
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {resourceTypes.map((type) => {
                  const Icon = type.icon;

                  return (
                    <Link
                      key={type.label}
                      href="/resources"
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <Icon size={19} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {type.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Resource inventory
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className="text-slate-400"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Footer */}
            <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>ResourceHub Resource Reservation System</p>
              <p className="inline-flex items-center gap-1">
                <Clock3 size={13} />
                Manage shared resources efficiently
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}