import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [
    totalResources,
    activeResources,
    totalReservations,
    confirmedReservations,
    cancelledReservations,
    todayReservations,
    upcomingReservations,
  ] = await Promise.all([
    prisma.resource.count(),

    prisma.resource.count({
      where: { isActive: true },
    }),

    prisma.reservation.count(),

    prisma.reservation.count({
      where: { status: "CONFIRMED" },
    }),

    prisma.reservation.count({
      where: { status: "CANCELLED" },
    }),

    prisma.reservation.count({
      where: {
        status: "CONFIRMED",
        startTime: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
      },
    }),

    prisma.reservation.count({
      where: {
        status: "CONFIRMED",
        startTime: {
          gte: startOfTomorrow,
        },
      },
    }),
  ]);

  return {
    totalResources,
    activeResources,
    totalReservations,
    confirmedReservations,
    cancelledReservations,
    todayReservations,
    upcomingReservations,
  };
}