"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsGroup } from "@/lib/actions/settings";
import SaveButton from "./SaveButton";

interface Props { freeLimit: number; starterLimit: number; premiumLimit: number; maxProfiles: number; }
export default function SettingsLimitsForm({ freeLimit, starterLimit, premiumLimit, maxProfiles }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveSettingsGroup("limits", {
        "limits.free.stories_per_month":    Number(fd.get("limits.free.stories_per_month")),
        "limits.starter.stories_per_month": Number(fd.get("limits.starter.stories_per_month")),
        "limits.premium.stories_per_month": Number(fd.get("limits.premium.stories_per_month")),
        "limits.max_child_profiles":        Number(fd.get("limits.max_child_profiles")),
      });
      router.push("/admin/ustawienia?section=limits&saved=1");
      router.refresh();
    });
  }

  const plans = [
    { key: "limits.free.stories_per_month",    label: "FREE — bajki/miesiąc",    color: "bg-slate-400",  default: freeLimit    },
    { key: "limits.starter.stories_per_month", label: "STARTER — bajki/miesiąc", color: "bg-orange-400", default: starterLimit  },
    { key: "limits.premium.stories_per_month", label: "PREMIUM — bajki/miesiąc", color: "bg-violet-500", default: premiumLimit  },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {plans.map(({ key, label, color, default: def }) => (
        <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-sm font-semibold text-slate-700">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" name={key} defaultValue={def} min={0} max={9999} required
              className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <span className="text-xs text-slate-400">bajek</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full bg-blue-400" />
          <span className="text-sm font-semibold text-slate-700">Maks. profile dzieci / konto</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" name="limits.max_child_profiles" defaultValue={maxProfiles} min={1} max={20} required
            className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <span className="text-xs text-slate-400">profili</span>
        </div>
      </div>
      <SaveButton pending={pending} />
    </form>
  );
}
