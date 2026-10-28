
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

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
