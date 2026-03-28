"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerAction } from "@/lib/auth/actions";
import SubmitButton from "@/components/auth/SubmitButton";

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------
type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function ocenHaslo(password: string): StrengthLevel {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as StrengthLevel;
}

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string; bars: number }> = {
  0: { label: "",              color: "bg-slate-200",  bars: 0 },
  1: { label: "Słabe",         color: "bg-red-400",    bars: 1 },
  2: { label: "Przeciętne",    color: "bg-amber-400",  bars: 2 },
  3: { label: "Dobre",         color: "bg-emerald-400", bars: 3 },
  4: { label: "Silne",         color: "bg-emerald-500", bars: 4 },
};

const FIELDS = ["name", "email", "password", "confirmPassword"] as const;

export default function RegisterForm() {
  const [state, action] = useFormState(registerAction, null);
  const [passwordValue, setPasswordValue] = useState("");
  const strength = ocenHaslo(passwordValue);
  const strengthCfg = STRENGTH_CONFIG[strength];

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black">Utwórz konto</h1>
        <p className="text-slate-500 mt-2">
          Dołącz do Bajkowego Świata — pierwsze 5 bajek gratis!
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8 space-y-5">
        {/* Globalny błąd */}
        {state?.error && !FIELDS.includes(state.field as typeof FIELDS[number]) && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          {/* Imię */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Imię i nazwisko
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jan Kowalski"
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-colors
                  focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                  ${state?.field === "name" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
            </div>
            {state?.field === "name" && (
              <p className="text-xs text-red-600">{state.error}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Adres email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="rodzic@przykład.pl"
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-colors
                  focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                  ${state?.field === "email" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
            </div>
            {state?.field === "email" && (
              <p className="text-xs text-red-600">{state.error}</p>
            )}
          </div>

          {/* Hasło */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 znaków"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-colors
                  focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                  ${state?.field === "password" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
            </div>

            {/* Pasek siły hasła */}
            {passwordValue && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        bar <= strengthCfg.bars ? strengthCfg.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : "text-emerald-600"}`}>
                  {strengthCfg.label}
                </p>
              </div>
            )}

            {state?.field === "password" ? (
              <p className="text-xs text-red-600">{state.error}</p>
            ) : !passwordValue ? (
              <p className="text-xs text-slate-400">Min. 8 znaków, wielka litera i cyfra</p>
            ) : null}
          </div>

          {/* Potwierdzenie hasła */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Powtórz hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-colors
                  focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                  ${state?.field === "confirmPassword" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
            </div>
            {state?.field === "confirmPassword" && (
              <p className="text-xs text-red-600">{state.error}</p>
            )}
          </div>

          {/* Benefity */}
          <ul className="space-y-1.5 pt-1">
            {["5 bajek za darmo", "Bez karty kredytowej", "Anuluj kiedy chcesz"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-1">
            <SubmitButton>Utwórz konto</SubmitButton>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Masz już konto?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
