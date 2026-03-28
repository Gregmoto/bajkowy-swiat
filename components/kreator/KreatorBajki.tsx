"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2, Check, ChevronRight, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  kreatorSchema,
  TEMATY_BAJEK,
  TONY_OPOWIESCI,
  DLUGOSCI_BAJKI,
  type KreatorFormData,
} from "@/lib/validators/kreator";
import { utworzBajke } from "@/lib/actions/kreator";
import type { ChildProfile } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AVATAR_FALLBACK: Record<string, string> = {
  BOY: "👦",
  GIRL: "👧",
  OTHER: "🧒",
};

function SekcjaKarty({ nr, tytul, opis, children }: {
  nr: number; tytul: string; opis: string; children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-orange-700">
          {nr}
        </span>
        <div>
          <h2 className="text-base font-black text-slate-900">{tytul}</h2>
          <p className="text-xs text-slate-500">{opis}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  profile: ChildProfile[];
  defaultChildProfileId?: string;
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------
export default function KreatorBajki({ profile, defaultChildProfileId }: Props) {
  const [blad, setBlad] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<KreatorFormData>({
    resolver: zodResolver(kreatorSchema),
    defaultValues: {
      childProfileId: defaultChildProfileId ?? "",
      temat: undefined,
      ton: "WESOLA",
      dlugosc: "MEDIUM",
      moral: "",
      extra: "",
    },
  });

  const selectedProfile = watch("childProfileId");
  const selectedTemat   = watch("temat");
  const selectedTon     = watch("ton");
  const selectedDlugosc = watch("dlugosc");

  function onSubmit(data: KreatorFormData) {
    setBlad(null);
    startTransition(async () => {
      const wynik = await utworzBajke(data);
      if (wynik?.error) setBlad(wynik.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">

      {/* ── 1. Profil dziecka ── */}
      <SekcjaKarty
        nr={1}
        tytul="Dla kogo jest bajka?"
        opis="Wybierz dziecko, dla którego chcesz stworzyć historię."
      >
        {profile.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Nie masz jeszcze żadnych profili dzieci.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/dzieci/nowe">Dodaj pierwsze dziecko →</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.map((dziecko) => {
              const active = selectedProfile === dziecko.id;
              const avatar = dziecko.avatar || AVATAR_FALLBACK[dziecko.gender] || "🧒";
              return (
                <button
                  key={dziecko.id}
                  type="button"
                  onClick={() => setValue("childProfileId", dziecko.id, { shouldValidate: true })}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    active
                      ? "border-orange-400 bg-orange-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                    {avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{dziecko.name}</p>
                    <p className="text-xs text-slate-500">{dziecko.age} lat</p>
                  </div>
                  {active && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-400 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {errors.childProfileId && (
          <p className="text-sm text-destructive">{errors.childProfileId.message}</p>
        )}
      </SekcjaKarty>

      {/* ── 2. Temat bajki ── */}
      <SekcjaKarty
        nr={2}
        tytul="Temat bajki"
        opis="Wybierz świat, w którym rozegra się historia."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMATY_BAJEK.map((temat) => {
            const active = selectedTemat === temat.value;
            return (
              <button
                key={temat.value}
                type="button"
                onClick={() => setValue("temat", temat.value, { shouldValidate: true })}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all ${
                  active
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-3xl">{temat.emoji}</span>
                <span className={`text-xs font-bold leading-tight ${active ? "text-orange-700" : "text-slate-700"}`}>
                  {temat.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">{temat.opis}</span>
              </button>
            );
          })}
        </div>
        {errors.temat && (
          <p className="text-sm text-destructive">{errors.temat.message}</p>
        )}
      </SekcjaKarty>

      {/* ── 3. Ton opowieści ── */}
      <SekcjaKarty
        nr={3}
        tytul="Ton opowieści"
        opis="Jaki nastrój ma mieć bajka?"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {TONY_OPOWIESCI.map((ton) => {
            const active = selectedTon === ton.value;
            return (
              <button
                key={ton.value}
                type="button"
                onClick={() => setValue("ton", ton.value, { shouldValidate: true })}
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span>{ton.emoji}</span>
                {ton.label}
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
        {errors.ton && (
          <p className="text-sm text-destructive">{errors.ton.message}</p>
        )}
      </SekcjaKarty>

      {/* ── 4. Długość ── */}
      <SekcjaKarty
        nr={4}
        tytul="Długość bajki"
        opis="Ile czasu masz na czytanie?"
      >
        <div className="grid grid-cols-3 gap-3">
          {DLUGOSCI_BAJKI.map((dl) => {
            const active = selectedDlugosc === dl.value;
            return (
              <button
                key={dl.value}
                type="button"
                onClick={() => setValue("dlugosc", dl.value, { shouldValidate: true })}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-4 text-center transition-all ${
                  active
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-2xl">{dl.emoji}</span>
                <span className={`text-sm font-bold ${active ? "text-orange-700" : "text-slate-700"}`}>
                  {dl.label}
                </span>
                <span className="text-xs text-slate-400">{dl.opis}</span>
              </button>
            );
          })}
        </div>
        {errors.dlugosc && (
          <p className="text-sm text-destructive">{errors.dlugosc.message}</p>
        )}
      </SekcjaKarty>

      {/* ── 5. Morał i szczegóły ── */}
      <SekcjaKarty
        nr={5}
        tytul="Morał i dodatkowe szczegóły"
        opis="Opcjonalnie — możesz pominąć ten krok."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moral">Morał lub przesłanie</Label>
            <Input
              id="moral"
              placeholder="np. warto pomagać innym, odwaga popłaca, przyjaźń jest ważna…"
              aria-invalid={!!errors.moral}
              onChange={(e) => setValue("moral", e.target.value)}
            />
            {errors.moral && (
              <p className="text-sm text-destructive">{errors.moral.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra">Dodatkowe szczegóły fabuły</Label>
            <Textarea
              id="extra"
              rows={3}
              className="resize-none"
              placeholder="np. bajka ma się dziać w zimowej krainie, pojawi się przyjazny smok o imieniu Kacper, historia ma kończyć się szczęśliwie…"
              aria-invalid={!!errors.extra}
              onChange={(e) => setValue("extra", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Maksymalnie 400 znaków</p>
            {errors.extra && (
              <p className="text-sm text-destructive">{errors.extra.message}</p>
            )}
          </div>
        </div>
      </SekcjaKarty>

      {/* ── Podsumowanie błędów walidacji ── */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Uzupełnij brakujące pola przed wysłaniem:
          </p>
          <ul className="space-y-0.5 pl-6 list-disc">
            {errors.childProfileId && (
              <li className="text-xs text-amber-700">{errors.childProfileId.message}</li>
            )}
            {errors.temat && (
              <li className="text-xs text-amber-700">{errors.temat.message}</li>
            )}
            {errors.ton && (
              <li className="text-xs text-amber-700">{errors.ton.message}</li>
            )}
            {errors.dlugosc && (
              <li className="text-xs text-amber-700">{errors.dlugosc.message}</li>
            )}
            {errors.moral && (
              <li className="text-xs text-amber-700">{errors.moral.message}</li>
            )}
            {errors.extra && (
              <li className="text-xs text-amber-700">{errors.extra.message}</li>
            )}
          </ul>
        </div>
      )}

      {/* ── Błąd serwera ── */}
      {blad && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{blad}</p>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="sticky bottom-4 pt-2">
        <Button
          type="submit"
          size="lg"
          className="btn-cta w-full justify-center text-base py-4"
          disabled={isPending || profile.length === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Zapisuję bajkę…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Stwórz bajkę
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {isPending && (
          <p className="mt-3 text-center text-sm text-muted-foreground animate-pulse">
            ✨ Tworzę wyjątkową bajkę dla Twojego dziecka…
          </p>
        )}
      </div>
    </form>
  );
}
