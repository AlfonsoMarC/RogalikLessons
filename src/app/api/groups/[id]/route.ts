import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: {
            start: "desc",
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const pendingPayment = group.lessons
      .filter((lesson) => !lesson.paid && new Date(lesson.end) <= new Date())
      .reduce((sum, lesson) => sum + lesson.price, 0);

    return NextResponse.json({ ...group, pendingPayment });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Error fetching group" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Error updating group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Primero eliminar las lecciones asociadas (por si cascade no funciona en SQLite)
    await prisma.lesson.deleteMany({
      where: { groupId: id },
    });
    
    // Luego eliminar el grupo
    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Error deleting group", details: String(error) },
      { status: 500 }
    );
  }
  }
}
