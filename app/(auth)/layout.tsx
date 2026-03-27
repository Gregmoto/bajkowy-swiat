import Link from "next/link";
import { Sparkles } from "lucide-react";

// Layout autoryzacji — wyśrodkowany formularz, bez bocznego panelu
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-violet-50 to-pink-50">
      <div className="w-full max-w-md space-y-6 px-4 py-12">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              Bajkowy Świat
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
