"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import { profilDzieckaSchema, type ProfilDzieckaInput } from "@/lib/validators/dziecko";
import { utworzProfilDziecka, zaktualizujProfilDziecka } from "@/lib/actions/dziecko";
import type { ChildProfile } from "@prisma/client";

// ---------------------------------------------------------------------------
// Stałe
// ---------------------------------------------------------------------------
const ZAINTERESOWANIA = [
  "Przyroda",
  "Zwierzęta",
  "Kosmos",
  "Sport",
  "Muzyka",
  "Sztuka",
  "Bajki",
  "Dinozaury",
  "Samochody",
  "Księżniczki",
  "Rycerze",
  "Nauka",
  "Gotowanie",
  "Taniec",
  "Piłka nożna",
  "Roboty",
];

const AVATARY = ["👦", "👧", "🧒", "🧑", "👶", "🦁", "🐯", "🐻", "🦊", "🐼", "🐨", "🦄"];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  dzieckoId?: string;
  defaultValues?: ChildProfile;
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------
export default function DzieckoForm({ dzieckoId, defaultValues }: Props) {
  const trybEdycji = !!dzieckoId;
  const [blad, setBlad] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProfilDzieckaInput>({
    resolver: zodResolver(profilDzieckaSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          age: defaultValues.age,
          gender: defaultValues.gender,
          interests: defaultValues.interests ?? [],
          favoriteColor: defaultValues.favoriteColor ?? "",
          favoriteAnimal: defaultValues.favoriteAnimal ?? "",
          notes: defaultValues.notes ?? "",
          avatar: defaultValues.avatar ?? "",
        }
      : {
          gender: "OTHER",
          interests: [],
          favoriteColor: "",
          favoriteAnimal: "",
          notes: "",
          avatar: "",
        },
  });

  const wybraneZainteresowania = watch("interests") ?? [];
  const wybranyAvatar = watch("avatar");
  const notesValue = watch("notes") ?? "";
  const NOTES_MAX = 500;

  function toggleZainteresowanie(z: string) {
    const obecne = watch("interests") ?? [];
    if (obecne.includes(z)) {
      setValue("interests", obecne.filter((i) => i !== z), { shouldValidate: true });
    } else {
      setValue("interests", [...obecne, z], { shouldValidate: true });
    }
  }

  // Fields that can receive server-side errors
  const POLA = ["name", "age", "gender", "interests", "favoriteColor", "favoriteAnimal", "notes", "avatar"] as const;

  function onSubmit(data: ProfilDzieckaInput) {
    setBlad(null);
    startTransition(async () => {
      const wynik = trybEdycji
        ? await zaktualizujProfilDziecka(dzieckoId!, data)
        : await utworzProfilDziecka(data);

      if (wynik?.error) {
        const field = wynik.field as typeof POLA[number] | undefined;
        if (field && POLA.includes(field)) {
          setError(field, { message: wynik.error });
        } else {
          setBlad(wynik.error);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* ── Avatar ── */}
          <div className="space-y-2">
            <Label>Avatar dziecka</Label>
            <div className="flex flex-wrap gap-2">
              {AVATARY.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue("avatar", wybranyAvatar === emoji ? "" : emoji)}
                  className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all border-2 ${
                    wybranyAvatar === emoji
                      ? "border-orange-400 bg-orange-50 scale-110"
                      : "border-transparent bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* ── Imię ── */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Imię dziecka <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="np. Zosia, Marek, Lena…"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* ── Wiek + Płeć ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">
                Wiek <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min={1}
                max={18}
                placeholder="np. 5"
                aria-invalid={!!errors.age}
                {...register("age")}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Płeć <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5 pt-1">
                    {(
                      [
                        { value: "BOY", label: "Chłopiec" },
                        { value: "GIRL", label: "Dziewczynka" },
                        { value: "OTHER", label: "Inne" },
                      ] as const
                    ).map(({ value, label }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="radio"
                          value={value}
                          checked={field.value === value}
                          onChange={() => field.onChange(value)}
                          className="accent-orange-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* ── Zainteresowania ── */}
          <div className="space-y-2">
            <Label>Zainteresowania</Label>
            <p className="text-xs text-muted-foreground">
              Zaznacz zainteresowania, które pojawią się w bajkach
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {ZAINTERESOWANIA.map((z) => {
                const zaznaczone = wybraneZainteresowania.includes(z);
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => toggleZainteresowanie(z)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-all border ${
                      zaznaczone
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    {zaznaczone && <Check className="h-3 w-3" />}
                    {z}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Ulubiony kolor + Ulubione zwierzę ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="favoriteColor">Ulubiony kolor</Label>
              <Input
                id="favoriteColor"
                placeholder="np. niebieski, różowy…"
                aria-invalid={!!errors.favoriteColor}
                {...register("favoriteColor")}
              />
              {errors.favoriteColor && (
                <p className="text-sm text-destructive">{errors.favoriteColor.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="favoriteAnimal">Ulubione zwierzę</Label>
              <Input
                id="favoriteAnimal"
                placeholder="np. piesek, smok…"
                aria-invalid={!!errors.favoriteAnimal}
                {...register("favoriteAnimal")}
              />
              {errors.favoriteAnimal && (
                <p className="text-sm text-destructive">{errors.favoriteAnimal.message}</p>
              )}
            </div>
          </div>

          {/* ── Dodatkowe informacje ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">Dodatkowe informacje</Label>
              <span className={`text-xs tabular-nums ${notesValue.length > NOTES_MAX ? "text-red-500 font-semibold" : "text-slate-400"}`}>
                {notesValue.length} / {NOTES_MAX}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Coś, o czym warto wiedzieć — cechy charakteru, ulubione postacie,
              fobie, itp.
            </p>
            <Textarea
              id="notes"
              rows={3}
              placeholder="np. Boi się ciemności, uwielbia Spider-Mana, ma psa o imieniu Burek…"
              className="resize-none"
              aria-invalid={!!errors.notes}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* ── Błąd globalny ── */}
          {blad && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{blad}</p>
            </div>
          )}

          {/* ── Przycisk ── */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {trybEdycji ? "Zapisz zmiany" : "Dodaj profil dziecka"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
