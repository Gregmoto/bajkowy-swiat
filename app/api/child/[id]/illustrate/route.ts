import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isReplicateConfigured, startIllustrationJob } from "@/lib/illustration";

export const runtime = "nodejs";

// POST — start illustration job
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nie jesteś zalogowany." }, { status: 401 });
  }

  const profile = await prisma.childProfile.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, photo: true, illustrationStatus: true },
  });

  if (!profile || profile.userId !== session.userId) {
    return NextResponse.json({ error: "Profil nie istnieje lub brak uprawnień." }, { status: 403 });
  }

  if (!profile.photo) {
    return NextResponse.json({ error: "Brak zdjęcia — prześlij zdjęcie najpierw." }, { status: 400 });
  }

  if (profile.illustrationStatus === "PROCESSING") {
    return NextResponse.json({ error: "Ilustracja jest już generowana." }, { status: 409 });
  }

  // --- Sprawdź czy API jest skonfigurowane
  if (!isReplicateConfigured()) {
    await prisma.childProfile.update({
      where: { id: params.id },
      data: {
        illustrationStatus: "FAILED",
        illustrationJobId: null,
      },
    });
    return NextResponse.json(
      { error: "Generowanie ilustracji nie jest skonfigurowane. Ustaw REPLICATE_API_TOKEN." },
      { status: 503 }
    );
  }

  // --- Ustaw status PROCESSING i uruchom job
  try {
    const jobId = await startIllustrationJob(profile.photo);

    await prisma.childProfile.update({
      where: { id: params.id },
      data: {
        illustrationStatus: "PROCESSING",
        illustrationJobId: jobId,
        illustration: null,
      },
    });

    return NextResponse.json({ ok: true, jobId, status: "PROCESSING" });
  } catch (err) {
    console.error("[illustrate] Failed to start job:", err);

    await prisma.childProfile.update({
      where: { id: params.id },
      data: { illustrationStatus: "FAILED", illustrationJobId: null },
    });

    return NextResponse.json(
      { error: "Nie udało się uruchomić generowania. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
