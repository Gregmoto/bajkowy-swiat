import { NextRequest, NextResponse } from "next/server";

interface Params { params: { id: string } }

// GET    /api/dzieci/[id]  — pobierz profil dziecka
// PATCH  /api/dzieci/[id]  — zaktualizuj profil
// DELETE /api/dzieci/[id]  — usuń profil
export async function GET(_: NextRequest, { params }: Params) {
  return NextResponse.json({ id: params.id });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  return NextResponse.json({ id: params.id, ...body });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  return NextResponse.json({ sukces: true });
}
