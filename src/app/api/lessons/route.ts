import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        student: true,
        group: true,
      },
      orderBy: {
        start: "desc",
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Error fetching lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, start, end, external, paid, price, type, studentId, groupId } = body;

    if (!start || !end || price === undefined || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type === "student" && !studentId) {
      return NextResponse.json(
        { error: "Student ID is required for student lessons" },
        { status: 400 }
      );
    }

    if (type === "group" && !groupId) {
      return NextResponse.json(
        { error: "Group ID is required for group lessons" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: title || "",
        start: new Date(start),
        end: new Date(end),
        external: external || false,
        paid: paid || false,
        price: parseFloat(price),
        type,
        studentId: type === "student" ? studentId : null,
        groupId: type === "group" ? groupId : null,
      },
      include: {
        student: true,
        group: true,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Error creating lesson" },
      { status: 500 }
    );
  }
}
