"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Filtry biblioteki bajek — wyszukiwarka + filtr motywu i dziecka
export default function BajkaFilter() {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Szukaj bajek..." className="pl-9" />
      </div>
      {/* TODO: Select motyw, Select dziecko, Select sortowanie */}
    </div>
  );
}
