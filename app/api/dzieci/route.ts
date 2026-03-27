import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET  /api/dzieci  — lista dzieci zalogowanego użytkownika
// POST /api/dzieci  — dodaj nowe dziecko
export async function GET() {
  // TODO: pobrać userId z sesji NextAuth
  // const session = await auth();
  // if (!session) return NextResponse.json({ error: "Nieuprawniony" }, { status: 401 });

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: walidacja + zapis do DB + powiązanie z userId

  return NextResponse.json({ id: "placeholder" }, { status: 201 });
}
