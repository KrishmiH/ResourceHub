import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to view reservations." },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";

    const reservations = await prisma.reservation.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        resource: {
          select: {
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
    console.error("Failed to fetch reservations:", error);

    return NextResponse.json(
      { message: "Unable to load reservations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to create reservations." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const resourceId =
      typeof data.resourceId === "string" ? data.resourceId.trim() : "";
    const reservedBy =
      typeof data.reservedBy === "string" ? data.reservedBy.trim() : "";
    const purpose =
      typeof data.purpose === "string" ? data.purpose.trim() : "";

    if (!resourceId || !reservedBy || !purpose) {
      return NextResponse.json(
        { message: "Resource, reserver name, and purpose are required." },
        { status: 400 }
      );
    }

    if (
      reservedBy.length > 100 ||
      purpose.length > 300
    ) {
      return NextResponse.json(
        { message: "Name or purpose exceeds the allowed length." },
        { status: 400 }
      );
    }

    const startTime =
      typeof data.startTime === "string"
        ? new Date(data.startTime)
        : new Date("");
    const endTime =
      typeof data.endTime === "string"
        ? new Date(data.endTime)
        : new Date("");

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      startTime >= endTime
    ) {
      return NextResponse.json(
        { message: "Please provide valid dates. The end must be after the start." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, isActive: true },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    if (!resource.isActive) {
      return NextResponse.json(
        { message: "This resource is inactive and cannot be reserved." },
        { status: 400 }
      );
    }

    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        resourceId,
        status: "CONFIRMED",
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });

    if (overlappingReservation) {
      return NextResponse.json(
        { message: "This resource is already reserved during that time." },
        { status: 409 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        resourceId,
        userId: session.user.id,
        reservedBy,
        purpose,
        startTime,
        endTime,
      },
      include: {
        resource: {
          select: { name: true, category: true, location: true },
        },
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation:", error);

    return NextResponse.json(
      { message: "Unable to create reservation." },
      { status: 500 }
    );
  }
}
