"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsGroup } from "@/lib/actions/settings";
import SaveButton from "./SaveButton";

interface Props { starterMonthly: number; starterYearly: number; premiumMonthly: number; premiumYearly: number; }
export default function SettingsPlansForm({ starterMonthly, starterYearly, premiumMonthly, premiumYearly }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveSettingsGroup("plans", {
        "plans.starter.monthly_price": Number(fd.get("plans.starter.monthly_price")),
        "plans.starter.yearly_price":  Number(fd.get("plans.starter.yearly_price")),
        "plans.premium.monthly_price": Number(fd.get("plans.premium.monthly_price")),
        "plans.premium.yearly_price":  Number(fd.get("plans.premium.yearly_price")),
      });
      router.push("/admin/ustawienia?section=plans&saved=1");
      router.refresh();
    });
  }

  function grToZl(gr: number) { return (gr / 100).toFixed(2); }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-xs text-slate-400 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ⚠️ Ceny podawane są w <strong>groszach</strong> (100 gr = 1 zł). Zmiana cen nie aktualizuje planów Stripe automatycznie.
      </p>
      {/* STARTER */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" /> Plan STARTER
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <PriceField name="plans.starter.monthly_price" label="Cena miesięczna (gr)" defaultValue={starterMonthly} zlValue={grToZl(starterMonthly)} />
          <PriceField name="plans.starter.yearly_price"  label="Cena roczna (gr)"     defaultValue={starterYearly}  zlValue={grToZl(starterYearly)} />
        </div>
      </div>
      {/* PREMIUM */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-500" /> Plan PREMIUM
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <PriceField name="plans.premium.monthly_price" label="Cena miesięczna (gr)" defaultValue={premiumMonthly} zlValue={grToZl(premiumMonthly)} />
          <PriceField name="plans.premium.yearly_price"  label="Cena roczna (gr)"     defaultValue={premiumYearly}  zlValue={grToZl(premiumYearly)} />
        </div>
      </div>
      <SaveButton pending={pending} />
    </form>
  );
}
function PriceField({ name, label, defaultValue, zlValue }: { name: string; label: string; defaultValue: number; zlValue: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-600 block">{label}</label>
      <div className="relative">
        <input type="number" name={name} defaultValue={defaultValue} min={0} step={1} required
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-14" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">{zlValue} zł</span>
      </div>
    </div>
  );
}
