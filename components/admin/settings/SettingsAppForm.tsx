"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsGroup } from "@/lib/actions/settings";
import SettingsField from "./SettingsField";
import SaveButton from "./SaveButton";

interface Props {
  appName: string; appTagline: string; contactEmail: string;
  supportEmail: string; fromName: string;
}
export default function SettingsAppForm({ appName, appTagline, contactEmail, supportEmail, fromName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveSettingsGroup("app", {
        "app.name":          fd.get("app.name"),
        "app.tagline":       fd.get("app.tagline"),
        "app.contact_email": fd.get("app.contact_email"),
        "app.support_email": fd.get("app.support_email"),
        "app.from_name":     fd.get("app.from_name"),
      });
      router.push("/admin/ustawienia?section=app&saved=1");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SettingsField name="app.name"          label="Nazwa aplikacji"      defaultValue={appName}       required />
      <SettingsField name="app.tagline"        label="Slogan"               defaultValue={appTagline}              />
      <SettingsField name="app.contact_email"  label="E-mail kontaktowy"    defaultValue={contactEmail}  type="email" />
      <SettingsField name="app.support_email"  label="E-mail supportu"      defaultValue={supportEmail}  type="email" />
      <SettingsField name="app.from_name"      label="Nazwa nadawcy e-mail" defaultValue={fromName}               />
      <SaveButton pending={pending} />
    </form>
  );
}
