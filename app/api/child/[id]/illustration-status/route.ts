import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  pollReplicatePrediction,
  extractIllustrationUrl,
  isReplicateConfigured,
} from "@/lib/illustration";
import { uploadToBlob, generateFilename } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nie jesteś zalogowany." }, { status: 401 });
  }

  const profile = await prisma.childProfile.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      illustrationStatus: true,
      illustrationJobId: true,
      illustration: true,
    },
  });

  if (!profile || profile.userId !== session.userId) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  // Jeśli status jest już finalny — zwróć go
  if (profile.illustrationStatus === "READY") {
    return NextResponse.json({
      status: "READY",
      illustrationUrl: profile.illustration,
    });
  }

  if (profile.illustrationStatus === "FAILED" || !profile.illustrationJobId) {
    return NextResponse.json({ status: profile.illustrationStatus ?? "FAILED" });
  }

  // Status PROCESSING — sprawdź w Replicate
  if (!isReplicateConfigured()) {
    return NextResponse.json({ status: "PROCESSING" });
  }

  try {
    const prediction = await pollReplicatePrediction(profile.illustrationJobId);

    if (prediction.status === "succeeded") {
      const externalUrl = extractIllustrationUrl(prediction);

      if (!externalUrl) {
        await prisma.childProfile.update({
          where: { id: params.id },
          data: { illustrationStatus: "FAILED", illustrationJobId: null },
        });
        return NextResponse.json({ status: "FAILED" });
      }

      // Pobierz obraz i zapisz do Vercel Blob (permanent storage)
      let illustrationUrl = externalUrl;
      try {
        const imgRes = await fetch(externalUrl);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const contentType = imgRes.headers.get("content-type") ?? "image/png";
          const filename = generateFilename(params.id, "illustration", "png");
          illustrationUrl = await uploadToBlob(buffer, filename, contentType, "illustrations");
        }
      } catch {
        // Jeśli zapis do Blob się nie powiedzie, użyj URL z Replicate
        illustrationUrl = externalUrl;
      }

      await prisma.childProfile.update({
        where: { id: params.id },
        data: {
          illustrationStatus: "READY",
          illustration: illustrationUrl,
          illustrationJobId: null,
        },
      });

      return NextResponse.json({ status: "READY", illustrationUrl });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      await prisma.childProfile.update({
        where: { id: params.id },
        data: { illustrationStatus: "FAILED", illustrationJobId: null },
      });
      return NextResponse.json({
        status: "FAILED",
        error: prediction.error ?? "Generowanie nie powiodło się.",
      });
    }

    // Nadal w toku (starting / processing)
    return NextResponse.json({ status: "PROCESSING" });
  } catch (err) {
    console.error("[illustration-status] Poll error:", err);
    return NextResponse.json({ status: "PROCESSING" });
  }
}
