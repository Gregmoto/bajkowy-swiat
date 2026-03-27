import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const story = await prisma.story.findUnique({ where: { id: params.id } });
    if (!story) return NextResponse.json({ error: "Bajka nie została znaleziona." }, { status: 404 });

    return NextResponse.json({
      ...story,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(`[GET /api/bajki/${params.id}]`, err);
    return NextResponse.json({ error: "Nie udało się pobrać bajki." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const story = await prisma.story.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!story) return NextResponse.json({ error: "Bajka nie została znaleziona." }, { status: 404 });

    await prisma.story.delete({ where: { id: params.id } });
    return NextResponse.json({ sukces: true });
  } catch (err) {
    console.error(`[DELETE /api/bajki/${params.id}]`, err);
    return NextResponse.json({ error: "Nie udało się usunąć bajki." }, { status: 500 });
  }
}
