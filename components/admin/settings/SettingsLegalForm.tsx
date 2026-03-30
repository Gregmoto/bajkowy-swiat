"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsGroup } from "@/lib/actions/settings";
import SettingsField from "./SettingsField";
import SaveButton from "./SaveButton";

interface Props {
  termsUrl: string; privacyUrl: string; cookiesUrl: string;
  company: string; nip: string; address: string;
}
export default function SettingsLegalForm({ termsUrl, privacyUrl, cookiesUrl, company, nip, address }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveSettingsGroup("legal", {
        "legal.terms_url":   fd.get("legal.terms_url"),
        "legal.privacy_url": fd.get("legal.privacy_url"),
        "legal.cookies_url": fd.get("legal.cookies_url"),
        "legal.company":     fd.get("legal.company"),
        "legal.nip":         fd.get("legal.nip"),
        "legal.address":     fd.get("legal.address"),
      });
      router.push("/admin/ustawienia?section=legal&saved=1");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">URL dokumentów prawnych</h3>
        <SettingsField name="legal.terms_url"   label="URL regulaminu"            defaultValue={termsUrl}   hint="Np. /regulamin lub https://…" />
        <SettingsField name="legal.privacy_url" label="URL polityki prywatności"  defaultValue={privacyUrl} hint="Np. /polityka-prywatnosci" />
        <SettingsField name="legal.cookies_url" label="URL polityki cookies"      defaultValue={cookiesUrl} hint="Np. /polityka-cookies" />
      </div>
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Dane firmy (faktury)</h3>
        <SettingsField name="legal.company" label="Nazwa firmy"    defaultValue={company} />
        <SettingsField name="legal.nip"     label="NIP"            defaultValue={nip}     hint="Bez spacji, np. 7271234567" />
        <SettingsField name="legal.address" label="Adres firmy"    defaultValue={address} textarea />
      </div>
      <SaveButton pending={pending} />
    </form>
  );
}
