import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        theme: true,
        language: true,
        status: true,
        coverImage: true,
        childProfileId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      stories.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("[GET /api/bajki]", err);
    return NextResponse.json({ error: "Nie udało się pobrać bajek." }, { status: 500 });
  }
}
