import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAuthorizedReservation(id: string) {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      reservation: null,
    };
  }

  const isAdmin = session.user.role === "ADMIN";

  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      ...(isAdmin ? {} : { userId: session.user.id }),
    },
  });

  return { session, reservation };
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { session, reservation } = await getAuthorizedReservation(id);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to view this reservation." },
        { status: 401 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    const result = await prisma.reservation.findUnique({
      where: { id },
      include: {
        resource: {
          select: {
            name: true,
            category: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ reservation: result });
  } catch (error) {
    console.error("Failed to fetch reservation:", error);

    return NextResponse.json(
      { message: "Unable to load reservation." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { session, reservation } = await getAuthorizedReservation(id);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to cancel reservations." },
        { status: 401 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { message: "This reservation is already cancelled." },
        { status: 409 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        resource: {
          select: {
            name: true,
            category: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ reservation: updatedReservation });
  } catch (error) {
    console.error("Failed to cancel reservation:", error);

    return NextResponse.json(
      { message: "Unable to cancel reservation." },
      { status: 500 }
    );
  }
}


export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { session, reservation } = await getAuthorizedReservation(id);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to delete reservations." },
        { status: 401 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Reservation deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete reservation:", error);

    return NextResponse.json(
      { message: "Unable to delete reservation." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { session, reservation } = await getAuthorizedReservation(id);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to update reservations." },
        { status: 401 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Cancelled reservations cannot be edited." },
        { status: 400 }
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

    if (reservedBy.length > 100 || purpose.length > 300) {
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
        {
          message:
            "Please provide valid dates. The end must be after the start.",
        },
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
        id: { not: id },
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

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        resourceId,
        reservedBy,
        purpose,
        startTime,
        endTime,
      },
      include: {
        resource: {
          select: {
            name: true,
            category: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ reservation: updatedReservation });
  } catch (error) {
    console.error("Failed to update reservation:", error);

    return NextResponse.json(
      { message: "Unable to update reservation." },
      { status: 500 }
    );
  }
}