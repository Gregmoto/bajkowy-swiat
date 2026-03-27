import BocznyPanel from "@/components/shared/BocznyPanel";
import Nawigacja from "@/components/shared/Nawigacja";

// Layout aplikacji — boczny panel nawigacji + nagłówek
// Wszystkie podstrony wymagają zalogowania (middleware.ts)
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nawigacja wariant="aplikacja" />
      <div className="flex flex-1">
        <BocznyPanel />
        <main className="flex-1 overflow-auto">
          <div className="container py-8 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
