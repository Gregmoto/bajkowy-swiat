"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import SubmitButton from "@/components/auth/SubmitButton";

export default function LoginForm() {
  const [state, action] = useFormState(loginAction, null);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black">Witaj z powrotem</h1>
        <p className="text-slate-500 mt-2">
          Zaloguj się, żeby wrócić do swoich bajek
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8 space-y-5">
        {/* Globalny błąd (np. nieprawidłowe hasło) */}
        {state?.error && !state.field && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Hasło
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Zapomniałem hasła
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-colors
                  focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                  ${state?.field === "password" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
            </div>
            {state?.field === "password" && (
              <p className="text-xs text-red-600">{state.error}</p>
            )}
          </div>

          <div className="pt-1">
            <SubmitButton>Zaloguj się</SubmitButton>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Nie masz konta?{" "}
          <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-700">
            Zarejestruj się za darmo
          </Link>
        </p>
      </div>
    </div>
  );
}
