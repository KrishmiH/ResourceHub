
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};


export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to view resources." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Failed to fetch resource:", error);

    return NextResponse.json(
      { message: "Unable to load resource." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to update resources." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "You do not have permission to update resources." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const updateData: {
      name?: string;
      category?: string;
      description?: string | null;
      location?: string | null;
      isActive?: boolean;
    } = {};

    if ("name" in data) {
      if (typeof data.name !== "string" || !data.name.trim()) {
        return NextResponse.json(
          { message: "Resource name cannot be empty." },
          { status: 400 }
        );
      }

      if (data.name.trim().length > 100) {
        return NextResponse.json(
          { message: "Resource name must be 100 characters or fewer." },
          { status: 400 }
        );
      }

      updateData.name = data.name.trim();
    }

    if ("category" in data) {
      if (
        typeof data.category !== "string" ||
        !data.category.trim() ||
        data.category.trim().length > 50
      ) {
        return NextResponse.json(
          { message: "Please provide a valid category." },
          { status: 400 }
        );
      }

      updateData.category = data.category.trim();
    }

    if ("description" in data) {
      if (
        data.description !== null &&
        typeof data.description !== "string"
      ) {
        return NextResponse.json(
          { message: "Invalid description." },
          { status: 400 }
        );
      }

      if (
        typeof data.description === "string" &&
        data.description.trim().length > 500
      ) {
        return NextResponse.json(
          { message: "Description must be 500 characters or fewer." },
          { status: 400 }
        );
      }

      updateData.description =
        typeof data.description === "string"
          ? data.description.trim() || null
          : null;
    }

    if ("location" in data) {
      if (
        data.location !== null &&
        typeof data.location !== "string"
      ) {
        return NextResponse.json(
          { message: "Invalid location." },
          { status: 400 }
        );
      }

      if (
        typeof data.location === "string" &&
        data.location.trim().length > 100
      ) {
        return NextResponse.json(
          { message: "Location must be 100 characters or fewer." },
          { status: 400 }
        );
      }

      updateData.location =
        typeof data.location === "string"
          ? data.location.trim() || null
          : null;
    }

    if ("isActive" in data) {
      if (typeof data.isActive !== "boolean") {
        return NextResponse.json(
          { message: "Invalid resource status." },
          { status: 400 }
        );
      }

      updateData.isActive = data.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided to update." },
        { status: 400 }
      );
    }

    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Resource updated successfully.",
      resource,
    });
  } catch (error) {
    console.error("Failed to update resource:", error);

    return NextResponse.json(
      { message: "Unable to update resource." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to delete resources." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "You do not have permission to delete resources." },
        { status: 403 }
      );
    }
    
    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 }
      );
    }

    if (resource._count.reservations > 0) {
      return NextResponse.json(
        {
          message:
            "This resource cannot be deleted because it has reservation history. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete resource:", error);

    return NextResponse.json(
      { message: "Unable to delete resource." },
      { status: 500 }
    );
  }
}