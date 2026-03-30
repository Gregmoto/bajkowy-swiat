"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Stałe
// ---------------------------------------------------------------------------
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LABEL = "JPG, PNG lub WEBP";
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  profileId: string;
  initialPhotoUrl?: string | null;
  onPhotoChange?: (url: string | null) => void;
  disabled?: boolean;
}

type UploadState =
  | { phase: "idle" }
  | { phase: "preview"; file: File; previewUrl: string }
  | { phase: "uploading" }
  | { phase: "done"; url: string }
  | { phase: "error"; message: string };

// ---------------------------------------------------------------------------
// Walidacja pliku (klientowa)
// ---------------------------------------------------------------------------
function validateFilePL(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Nieobsługiwany format pliku. Dozwolone: ${ALLOWED_LABEL}.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `Plik jest za duży (${sizeMB} MB). Maksymalny rozmiar to ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------
export default function ChildPhotoUpload({
  profileId,
  initialPhotoUrl,
  onPhotoChange,
  disabled = false,
}: Props) {
  const [state, setState] = useState<UploadState>(
    initialPhotoUrl ? { phase: "done", url: initialPhotoUrl } : { phase: "idle" }
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Wybór pliku
  // ---------------------------------------------------------------------------
  const handleFile = useCallback(
    (file: File) => {
      const err = validateFilePL(file);
      if (err) {
        setState({ phase: "error", message: err });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setState({ phase: "preview", file, previewUrl });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Przesyłanie
  // ---------------------------------------------------------------------------
  async function handleUpload() {
    if (state.phase !== "preview") return;
    const { file, previewUrl } = state;

    setState({ phase: "uploading" });

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("profileId", profileId);

      const res = await fetch("/api/upload/child-photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok || !data.photoUrl) {
        setState({ phase: "error", message: data.error ?? "Błąd przesyłania. Spróbuj ponownie." });
        return;
      }

      URL.revokeObjectURL(previewUrl);
      setState({ phase: "done", url: data.photoUrl });
      onPhotoChange?.(data.photoUrl);
    } catch {
      setState({ phase: "error", message: "Błąd połączenia. Sprawdź internet i spróbuj ponownie." });
    }
  }

  // ---------------------------------------------------------------------------
  // Usuwanie
  // ---------------------------------------------------------------------------
  async function handleDelete() {
    const currentUrl =
      state.phase === "done" ? state.url : null;

    setState({ phase: "uploading" }); // Pokaz spinner podczas usuwania

    try {
      const res = await fetch("/api/upload/child-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState(currentUrl ? { phase: "done", url: currentUrl } : { phase: "idle" });
        alert(data.error ?? "Nie udało się usunąć zdjęcia.");
        return;
      }

      setState({ phase: "idle" });
      onPhotoChange?.(null);
    } catch {
      setState(currentUrl ? { phase: "done", url: currentUrl } : { phase: "idle" });
    }
  }

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  // ---------------------------------------------------------------------------
  // Anuluj podgląd
  // ---------------------------------------------------------------------------
  function handleCancel() {
    if (state.phase === "preview") URL.revokeObjectURL(state.previewUrl);
    setState({ phase: "idle" });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const isLoading = state.phase === "uploading";

  // Gotowe zdjęcie — wyświetl podgląd + przyciski
  if (state.phase === "done") {
    return (
      <div className="space-y-3">
        <div className="relative inline-block">
          <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-orange-200 shadow-md">
            <Image
              src={state.url}
              alt="Zdjęcie dziecka"
              width={112}
              height={112}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Zmień zdjęcie
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Usuń zdjęcie
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    );
  }

  // Podgląd przed przesłaniem
  if (state.phase === "preview") {
    return (
      <div className="space-y-3">
        <div className="relative inline-block">
          <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-orange-300 shadow-md">
            <Image
              src={state.previewUrl}
              alt="Podgląd zdjęcia"
              width={112}
              height={112}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute -top-2 -right-2">
            <span className="inline-block rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
              Podgląd
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Plik: <strong>{state.file.name}</strong> ({(state.file.size / 1024).toFixed(0)} KB)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Wyślij zdjęcie
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-4 w-4" />
            Anuluj
          </button>
        </div>
      </div>
    );
  }

  // Błąd
  if (state.phase === "error") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setState({ phase: "idle" })}
          className="text-xs font-semibold text-orange-600 hover:underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  // Idle + Uploading — strefa drag & drop
  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => !disabled && !isLoading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-orange-400 bg-orange-50"
            : isLoading
            ? "border-slate-200 bg-slate-50 cursor-wait"
            : "border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/30"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-slate-500">Przesyłanie…</p>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragOver ? "Upuść zdjęcie tutaj" : "Dodaj zdjęcie dziecka"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Przeciągnij plik lub <span className="text-orange-600 font-semibold">kliknij, aby wybrać</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {ALLOWED_LABEL} · maks. {MAX_SIZE_MB} MB
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
