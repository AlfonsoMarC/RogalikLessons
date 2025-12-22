import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        lessons: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate pending payments for each student
    const studentsWithPendingPayment = students.map((student) => {
      const pendingPayment = student.lessons
        .filter((lesson) => !lesson.paid && new Date(lesson.end) <= new Date())
        .reduce((sum, lesson) => sum + lesson.price, 0);

      return {
        ...student,
        pendingPayment,
      };
    });

    return NextResponse.json(studentsWithPendingPayment);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Error fetching students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Error creating student" },
      { status: 500 }
    );
  }
}
