import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { connection, NextResponse } from "next/server";

export async function GET() {
  await connection();

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
      select: {
        id: true,
        reservedBy: true,
        purpose: true,
        startTime: true,
        endTime: true,
        status: true,
        resource: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Calendar reservations error:", error);

    return NextResponse.json(
      { message: "Unable to load calendar reservations." },
      { status: 500 }
    );
  }
}
