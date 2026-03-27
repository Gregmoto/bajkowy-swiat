import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50/40">
      {/* Dekoracyjne tło */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 px-4 py-12">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-xl">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="text-gradient">Bajkowy Świat</span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
