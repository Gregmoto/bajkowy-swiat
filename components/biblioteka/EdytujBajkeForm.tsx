"use client";

import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zaktualizujBajke } from "@/lib/actions/bajka";
import type { Story } from "@prisma/client";

const schema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(200, "Tytuł jest za długi").trim(),
  summary: z.string().max(500, "Opis jest za długi").trim().optional().or(z.literal("")),
  content: z.string().max(20000, "Treść jest za długa").trim().optional().or(z.literal("")),
  moral: z.string().max(300, "Morał jest za długi").trim().optional().or(z.literal("")),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Gotowa" },
  { value: "DRAFT",     label: "Szkic" },
  { value: "ARCHIVED",  label: "Archiwum" },
] as const;

export default function EdytujBajkeForm({ story }: { story: Story }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:   story.title,
      summary: story.summary ?? "",
      content: story.content ?? "",
      moral:   story.moral   ?? "",
      status:  story.status  as "PUBLISHED" | "DRAFT" | "ARCHIVED",
    },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await zaktualizujBajke(story.id, values);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Tytuł */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Tytuł bajki</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Tytuł bajki"
          disabled={isPending}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          {...register("status")}
          disabled={isPending}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Opis */}
      <div className="space-y-1.5">
        <Label htmlFor="summary">
          Krótki opis <span className="text-muted-foreground font-normal">(opcjonalny)</span>
        </Label>
        <Textarea
          id="summary"
          {...register("summary")}
          placeholder="1–2 zdania streszczające bajkę…"
          rows={2}
          disabled={isPending}
        />
        {errors.summary && (
          <p className="text-xs text-red-600">{errors.summary.message}</p>
        )}
      </div>

      {/* Morał */}
      <div className="space-y-1.5">
        <Label htmlFor="moral">
          Morał <span className="text-muted-foreground font-normal">(opcjonalny)</span>
        </Label>
        <Input
          id="moral"
          {...register("moral")}
          placeholder="Przesłanie lub morał bajki…"
          disabled={isPending}
        />
        {errors.moral && (
          <p className="text-xs text-red-600">{errors.moral.message}</p>
        )}
      </div>

      {/* Treść */}
      <div className="space-y-1.5">
        <Label htmlFor="content">
          Treść bajki <span className="text-muted-foreground font-normal">(opcjonalna)</span>
        </Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="Pełna treść bajki…"
          rows={16}
          disabled={isPending}
          className="font-['Georgia',serif] text-sm leading-relaxed resize-y"
        />
        {errors.content && (
          <p className="text-xs text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Akcje */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zapisuję…
            </>
          ) : (
            "Zapisz zmiany"
          )}
        </Button>
      </div>
    </form>
  );
}

