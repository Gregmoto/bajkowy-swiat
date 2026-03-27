import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const bajka = await prisma.bajka.findUnique({
      where: { id: params.id },
    });

    if (!bajka) {
      return NextResponse.json(
        { error: "Bajka nie została znaleziona." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...bajka,
      created: bajka.created.toISOString(),
      updated: bajka.updated.toISOString(),
    });
  } catch (blad) {
    console.error(`[GET /api/bajki/${params.id}] Błąd:`, blad);
    return NextResponse.json(
      { error: "Nie udało się pobrać bajki." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const bajka = await prisma.bajka.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!bajka) {
      return NextResponse.json(
        { error: "Bajka nie została znaleziona." },
        { status: 404 }
      );
    }

    await prisma.bajka.delete({ where: { id: params.id } });

    return NextResponse.json({ sukces: true }, { status: 200 });
  } catch (blad) {
    console.error(`[DELETE /api/bajki/${params.id}] Błąd:`, blad);
    return NextResponse.json(
      { error: "Nie udało się usunąć bajki." },
      { status: 500 }
    );
  }
}
