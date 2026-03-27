"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Loader2,
  User,
  Heart,
  BookOpen,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bajkaSchema, type BajkaFormData } from "@/lib/validations";

const MOTYWY_OPCJE = [
  { value: "przygoda", label: "🗺️ Przygoda", opis: "Nieoczekiwane odkrycia" },
  { value: "magia", label: "✨ Magia", opis: "Czary i cuda" },
  { value: "przyjazn", label: "🤝 Przyjaźń", opis: "Siła więzi" },
  { value: "zwierzeta", label: "🦋 Zwierzęta", opis: "Zwierzęce przygody" },
  { value: "kosmos", label: "🚀 Kosmos", opis: "Gwiezdna podróż" },
];

function SekcjaFormularza({
  ikona,
  tytul,
  opis,
  children,
}: {
  ikona: React.ReactNode;
  tytul: string;
  opis: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {ikona}
          </span>
          {tytul}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{opis}</p>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function BajkaForm() {
  const router = useRouter();
  const [blad, setBlad] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BajkaFormData>({
    resolver: zodResolver(bajkaSchema),
  });

  const onSubmit = async (data: BajkaFormData) => {
    setBlad(null);
    try {
      const res = await fetch("/api/generuj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setBlad(
          json.error ?? "Wystąpił błąd podczas generowania bajki."
        );
        return;
      }

      const { id } = await res.json();
      router.push(`/bajki/${id}`);
    } catch {
      setBlad("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sekcja 1: O dziecku */}
      <SekcjaFormularza
        ikona={<User className="h-4 w-4" />}
        tytul="O Twoim dziecku"
        opis="Podaj podstawowe informacje o głównym bohaterze bajki."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="imie">
              Imię dziecka <span className="text-destructive">*</span>
            </Label>
            <Input
              id="imie"
              placeholder="np. Zosia, Marek, Ala..."
              {...register("imie")}
              aria-invalid={!!errors.imie}
            />
            {errors.imie && (
              <p className="text-xs text-destructive">{errors.imie.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wiek">
              Wiek <span className="text-destructive">*</span>
            </Label>
            <Input
              id="wiek"
              type="number"
              min={2}
              max={12}
              placeholder="np. 5"
              {...register("wiek", { valueAsNumber: true })}
              aria-invalid={!!errors.wiek}
            />
            {errors.wiek && (
              <p className="text-xs text-destructive">{errors.wiek.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Płeć <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="plec"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-invalid={!!errors.plec}>
                  <SelectValue placeholder="Wybierz płeć..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chlopiec">👦 Chłopiec</SelectItem>
                  <SelectItem value="dziewczynka">👧 Dziewczynka</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.plec && (
            <p className="text-xs text-destructive">{errors.plec.message}</p>
          )}
        </div>
      </SekcjaFormularza>

      {/* Sekcja 2: Preferencje */}
      <SekcjaFormularza
        ikona={<Heart className="h-4 w-4" />}
        tytul="Co lubi Twoje dziecko?"
        opis="Te szczegóły sprawią, że bajka będzie jeszcze bardziej wyjątkowa."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="ulubZwierze">Ulubione zwierzę</Label>
            <Input
              id="ulubZwierze"
              placeholder="np. piesek, kot, smok..."
              {...register("ulubZwierze")}
            />
            {errors.ulubZwierze && (
              <p className="text-xs text-destructive">
                {errors.ulubZwierze.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ulubKolor">Ulubiony kolor</Label>
            <Input
              id="ulubKolor"
              placeholder="np. niebieski, różowy..."
              {...register("ulubKolor")}
            />
            {errors.ulubKolor && (
              <p className="text-xs text-destructive">
                {errors.ulubKolor.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ulubZabawka">Ulubiona zabawka</Label>
            <Input
              id="ulubZabawka"
              placeholder="np. miś, klocki, lalka..."
              {...register("ulubZabawka")}
            />
            {errors.ulubZabawka && (
              <p className="text-xs text-destructive">
                {errors.ulubZabawka.message}
              </p>
            )}
          </div>
        </div>
      </SekcjaFormularza>

      {/* Sekcja 3: Bajka */}
      <SekcjaFormularza
        ikona={<BookOpen className="h-4 w-4" />}
        tytul="Jaka bajka?"
        opis="Wybierz motyw i opcjonalnie dodaj szczegóły fabuły."
      >
        <div className="space-y-2">
          <Label>
            Motyw bajki <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="motyw"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-invalid={!!errors.motyw}>
                  <SelectValue placeholder="Wybierz motyw..." />
                </SelectTrigger>
                <SelectContent>
                  {MOTYWY_OPCJE.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2">
                        {m.label}
                        <span className="text-muted-foreground text-xs">
                          — {m.opis}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.motyw && (
            <p className="text-xs text-destructive">{errors.motyw.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="moral">Morał bajki (opcjonalnie)</Label>
          <Input
            id="moral"
            placeholder="np. warto być odważnym, przyjaźń jest ważna..."
            {...register("moral")}
          />
          {errors.moral && (
            <p className="text-xs text-destructive">{errors.moral.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dodatkowe">Dodatkowe elementy (opcjonalnie)</Label>
          <Textarea
            id="dodatkowe"
            placeholder="np. bajka ma się dziać w lesie, pojawi się tajemniczy zamek, główny bohater pomoże zagubionemu jeżowi..."
            className="min-h-[90px] resize-none"
            {...register("dodatkowe")}
          />
          <p className="text-xs text-muted-foreground">
            Maksymalnie 200 znaków
          </p>
          {errors.dodatkowe && (
            <p className="text-xs text-destructive">
              {errors.dodatkowe.message}
            </p>
          )}
        </div>
      </SekcjaFormularza>

      {/* Błąd globalny */}
      {blad && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{blad}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Tworzę bajkę… (to może chwilę potrwać)
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Stwórz bajkę!
          </>
        )}
      </Button>

      {isSubmitting && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          ✨ Nasz bajkopis właśnie pisze historię dla Twojego dziecka…
        </p>
      )}
    </form>
  );
}
