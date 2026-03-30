import { Check, Loader2 } from "lucide-react";

interface Props { pending: boolean; label?: string; }
export default function SaveButton({ pending, label = "Zapisz ustawienia" }: Props) {
  return (
    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Zapisuję…</>
        ) : (
          <><Check className="h-4 w-4" /> {label}</>
        )}
      </button>
      <p className="text-xs text-slate-400">Zmiany są aktywne natychmiast po zapisaniu.</p>
    </div>
  );
}
