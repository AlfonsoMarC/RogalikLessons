import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: {
            start: "desc",
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const pendingPayment = student.lessons
      .filter((lesson) => !lesson.paid && new Date(lesson.end) <= new Date())
      .reduce((sum, lesson) => sum + lesson.price, 0);

    return NextResponse.json({ ...student, pendingPayment });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Error fetching student" },
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

    const student = await prisma.student.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Error updating student" },
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
    
    // Verificar si el estudiante existe
    const student = await prisma.student.findUnique({
      where: { id },
    });
    
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    
    // Primero eliminar las lecciones asociadas
    await prisma.lesson.deleteMany({
      where: { studentId: id },
    });
    
    // Luego eliminar el estudiante
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Error deleting student", details: String(error) },
      { status: 500 }
    );
  }
}
