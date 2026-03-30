"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Loader2, AlertTriangle, RefreshCw, Wand2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Typy
// ---------------------------------------------------------------------------
type IllustrationStatus = "PROCESSING" | "READY" | "FAILED" | null;

interface Props {
  profileId:           string;
  hasPhoto:            boolean;
  initialStatus:       IllustrationStatus;
  initialIllustration: string | null;
}

// ---------------------------------------------------------------------------
// Hook pollujący
// ---------------------------------------------------------------------------
function useIllustrationPoll(
  profileId: string,
  shouldPoll: boolean,
  onResult: (status: IllustrationStatus, url: string | null) => void
) {
  useEffect(() => {
    if (!shouldPoll) return;
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(`/api/child/${profileId}/illustration-status`, {
            cache: "no-store",
          });
          const data = await res.json();

          if (data.status === "READY" || data.status === "FAILED") {
            if (!cancelled) onResult(data.status, data.illustrationUrl ?? null);
            return;
          }
        } catch {
          // Ignoruj błędy sieciowe podczas pollowania
        }
        // Czekaj 3s między zapytaniami
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [profileId, shouldPoll, onResult]);
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------
export default function IllustrationCard({
  profileId,
  hasPhoto,
  initialStatus,
  initialIllustration,
}: Props) {
  const [status, setStatus]         = useState<IllustrationStatus>(initialStatus);
  const [illustration, setIllust]   = useState<string | null>(initialIllustration);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const isPolling = status === "PROCESSING";

  const handleResult = useCallback(
    (newStatus: IllustrationStatus, url: string | null) => {
      setStatus(newStatus);
      if (url) setIllust(url);
    },
    []
  );

  useIllustrationPoll(profileId, isPolling, handleResult);

  // ---------------------------------------------------------------------------
  // Start illustration
  // ---------------------------------------------------------------------------
  async function handleGenerate() {
    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch(`/api/child/${profileId}/illustrate`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Błąd uruchamiania generowania.");
        return;
      }
      setStatus("PROCESSING");
      setIllust(null);
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsStarting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Brak zdjęcia → nie pokazuj karty
  if (!hasPhoto) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      {/* Nagłówek */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800">Ilustracja bajkowa</h3>
          <p className="text-[11px] text-slate-400">AI generuje wersję w stylu kreskówki</p>
        </div>
      </div>

      {/* Status: PROCESSING */}
      {status === "PROCESSING" && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-violet-50 p-6 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-700">Generuję ilustrację…</p>
            <p className="text-xs text-violet-400 mt-0.5">To może potrwać do minuty</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status: READY */}
      {status === "READY" && illustration && (
        <div className="space-y-3">
          <div className="relative h-48 w-full rounded-xl overflow-hidden border border-violet-100 shadow-sm">
            <Image
              src={illustration}
              alt="Ilustracja bajkowa dziecka"
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-violet-600 shadow-sm">
              <Sparkles className="h-3 w-3" /> Gotowa
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isStarting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStarting ? "animate-spin" : ""}`} />
            Wygeneruj ponownie
          </button>
        </div>
      )}

      {/* Status: FAILED */}
      {status === "FAILED" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Generowanie nie powiodło się</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Sprawdź połączenie i konfigurację serwisu ilustracji.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isStarting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isStarting ? "animate-spin" : ""}`} />
            {isStarting ? "Uruchamiam…" : "Spróbuj ponownie"}
          </button>
        </div>
      )}

      {/* Status: null (brak — zachęt do generowania) */}
      {status === null && (
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-orange-50 border border-violet-100 p-4 text-center">
            <p className="text-sm text-slate-600">
              Przekształć zdjęcie w ilustrację w stylu bajkowym! 🎨
            </p>
            <p className="text-xs text-slate-400 mt-1">
              AI stworzy kolorową, przyjazną wersję twarzy Twojego dziecka.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isStarting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:from-violet-600 hover:to-orange-600 transition-all disabled:opacity-60 shadow-sm"
          >
            {isStarting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uruchamiam…</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Wygeneruj ilustrację bajkową</>
            )}
          </button>
        </div>
      )}

      {/* Błąd akcji */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
