import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET   /api/user  — dane zalogowanego użytkownika
// PATCH /api/user  — aktualizacja danych (imię, email)
export async function GET() {
  // TODO: const session = await auth();
  return NextResponse.json({ id: null, name: null, email: null, plan: "free" });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ sukces: true, ...body });
}
