import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { validateFile, uploadToBlob, deleteFromBlob, generateFilename, mimeToExt } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // --- Auth
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nie jesteś zalogowany." }, { status: 401 });
  }

  // --- Parse form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane formularza." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const profileId = formData.get("profileId") as string | null;

  if (!file || !profileId) {
    return NextResponse.json({ error: "Brak pliku lub ID profilu." }, { status: 400 });
  }

  // --- Sprawdź czy profil należy do użytkownika
  const profile = await prisma.childProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, photo: true },
  });

  if (!profile || profile.userId !== session.userId) {
    return NextResponse.json({ error: "Profil nie istnieje lub brak uprawnień." }, { status: 403 });
  }

  // --- Walidacja pliku
  const validation = validateFile({ type: file.type, size: file.size });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  // --- Usuń stare zdjęcie z Blob (jeśli istnieje)
  if (profile.photo) {
    await deleteFromBlob(profile.photo);
  }

  // --- Upload do Vercel Blob
  const ext = mimeToExt(file.type);
  const filename = generateFilename(profileId, "photo", ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  let photoUrl: string;
  try {
    photoUrl = await uploadToBlob(buffer, filename, file.type, "child-photos");
  } catch (err) {
    console.error("[upload] Blob upload failed:", err);
    return NextResponse.json({ error: "Błąd przesyłania pliku. Spróbuj ponownie." }, { status: 500 });
  }

  // --- Zapisz URL w bazie + zresetuj status ilustracji
  await prisma.childProfile.update({
    where: { id: profileId },
    data: {
      photo: photoUrl,
      illustration: null,
      illustrationStatus: null,
      illustrationJobId: null,
    },
  });

  return NextResponse.json({ ok: true, photoUrl });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nie jesteś zalogowany." }, { status: 401 });
  }

  const { profileId } = await req.json();
  if (!profileId) {
    return NextResponse.json({ error: "Brak ID profilu." }, { status: 400 });
  }

  const profile = await prisma.childProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, photo: true, illustration: true },
  });

  if (!profile || profile.userId !== session.userId) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  // Usuń pliki z Blob
  if (profile.photo) await deleteFromBlob(profile.photo);
  if (profile.illustration) await deleteFromBlob(profile.illustration);

  // Wyczyść w bazie
  await prisma.childProfile.update({
    where: { id: profileId },
    data: {
      photo: null,
      illustration: null,
      illustrationStatus: null,
      illustrationJobId: null,
    },
  });

  return NextResponse.json({ ok: true });
}
