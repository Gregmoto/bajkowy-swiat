"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  dzieckoId?: string; // jeśli podane — tryb edycji
}

// Formularz dodawania/edycji profilu dziecka
export default function DzieckoForm({ dzieckoId }: Props) {
  const trybEdycji = !!dzieckoId;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imie">Imię dziecka *</Label>
          <Input id="imie" placeholder="np. Zosia, Marek..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wiek">Wiek *</Label>
            <Input id="wiek" type="number" min={2} max={12} placeholder="np. 5" />
          </div>
          <div className="space-y-2">
            <Label>Płeć *</Label>
            {/* TODO: Select płeć */}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ulubZwierze">Ulubione zwierzę</Label>
          <Input id="ulubZwierze" placeholder="np. piesek, kot..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ulubKolor">Ulubiony kolor</Label>
          <Input id="ulubKolor" placeholder="np. niebieski, różowy..." />
        </div>
        <Button className="w-full">
          {trybEdycji ? "Zapisz zmiany" : "Dodaj profil"}
        </Button>
      </CardContent>
    </Card>
  );
}
