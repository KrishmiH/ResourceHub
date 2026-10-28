
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return NextResponse.json(
      { message: "Unable to load resources." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      !("category" in body)
    ) {
      return NextResponse.json(
        { message: "Resource name and category are required." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const name =
      typeof data.name === "string" ? data.name.trim() : "";
    const category =
      typeof data.category === "string" ? data.category.trim() : "";
    const description =
      typeof data.description === "string"
        ? data.description.trim()
        : "";
    const location =
      typeof data.location === "string" ? data.location.trim() : "";

    if (!name || !category) {
      return NextResponse.json(
        { message: "Resource name and category are required." },
        { status: 400 }
      );
    }

    if (
      name.length > 100 ||
      category.length > 50 ||
      description.length > 500 ||
      location.length > 100
    ) {
      return NextResponse.json(
        { message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        category,
        description: description || null,
        location: location || null,
      },
    });

    return NextResponse.json(
      {
        message: "Resource created successfully.",
        resource,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create resource:", error);

    return NextResponse.json(
      { message: "Unable to create resource. Please try again." },
      { status: 500 }
    );
  }
}
