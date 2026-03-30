"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsGroup } from "@/lib/actions/settings";
import SettingsField from "./SettingsField";
import SaveButton from "./SaveButton";

interface Props { title: string; description: string; keywords: string; ogImage: string; }
export default function SettingsSeoForm({ title, description, keywords, ogImage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveSettingsGroup("seo", {
        "seo.title":       fd.get("seo.title"),
        "seo.description": fd.get("seo.description"),
        "seo.keywords":    fd.get("seo.keywords"),
        "seo.og_image":    fd.get("seo.og_image"),
      });
      router.push("/admin/ustawienia?section=seo&saved=1");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SettingsField name="seo.title"       label="Meta title"             defaultValue={title}       required hint="Tytuł strony w wyszukiwarce (zalecane: 50–60 znaków)" />
      <SettingsField name="seo.description" label="Meta description"       defaultValue={description} textarea hint="Opis strony w wyszukiwarce (zalecane: 120–160 znaków)" />
      <SettingsField name="seo.keywords"    label="Słowa kluczowe"         defaultValue={keywords}    hint="Oddzielone przecinkami" />
      <SettingsField name="seo.og_image"    label="URL obrazu OG"          defaultValue={ogImage}     hint="Np. /og-image.png lub pełny URL" />
      <SaveButton pending={pending} />
    </form>
  );
}
