import { put, del } from "@vercel/blob";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

export function validateFile(
  file: { type: string; size: number }
): { ok: true } | { ok: false; error: string } {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: "Dozwolone formaty: JPG, PNG, WEBP." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Plik jest za duży. Maksymalny rozmiar to 5 MB." };
  }
  return { ok: true };
}

export async function uploadToBlob(
  data: Blob | Buffer,
  filename: string,
  contentType: string,
  folder = "photos"
): Promise<string> {
  const { url } = await put(`${folder}/${filename}`, data, {
    access: "public",
    contentType,
  });
  return url;
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // Ignoruj błędy usuwania (plik mógł już nie istnieć)
  }
}

export function generateFilename(
  profileId: string,
  suffix: string,
  ext: string
): string {
  const ts = Date.now();
  return `${profileId}-${suffix}-${ts}.${ext}`;
}

export function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime] ?? "jpg";
}
