import { Metadata } from "next";
import PowitanieWidget from "@/components/dashboard/PowitanieWidget";
import StatystykiWidget from "@/components/dashboard/StatystykiWidget";
import OstatnieBajkiWidget from "@/components/dashboard/OstatnieBajkiWidget";
import SzybkiKreatorWidget from "@/components/dashboard/SzybkiKreatorWidget";

export const metadata: Metadata = {
  title: "Dashboard — Bajkowy Świat",
};

// Dashboard — przegląd aktywności, skróty do kluczowych akcji
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PowitanieWidget />
      <div className="grid gap-4 md:grid-cols-3">
        <StatystykiWidget />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <OstatnieBajkiWidget />
        <SzybkiKreatorWidget />
      </div>
    </div>
  );
}
