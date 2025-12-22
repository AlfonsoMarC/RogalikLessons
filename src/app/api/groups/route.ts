import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        lessons: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate pending payments for each group
    const groupsWithPendingPayment = groups.map((group) => {
      const pendingPayment = group.lessons
        .filter((lesson) => !lesson.paid && new Date(lesson.end) <= new Date())
        .reduce((sum, lesson) => sum + lesson.price, 0);

      return {
        ...group,
        pendingPayment,
      };
    });

    return NextResponse.json(groupsWithPendingPayment);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Error fetching groups" },
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

    const group = await prisma.group.create({
      data: {
        name,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Error creating group" },
      { status: 500 }
    );
  }
}
