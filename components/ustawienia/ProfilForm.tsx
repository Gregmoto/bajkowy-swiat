"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Formularz ustawień konta — imię, email, zmiana hasła, strefa niebezpieczna
export default function ProfilForm() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Dane osobowe</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input id="name" defaultValue="Jan Kowalski" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <Input id="email" type="email" defaultValue="jan@example.com" />
          </div>
          <Button>Zapisz zmiany</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Zmiana hasła</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Aktualne hasło</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nowe hasło</Label>
            <Input id="new-password" type="password" />
          </div>
          <Button variant="outline">Zmień hasło</Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-destructive">Strefa niebezpieczna</p>
        <p className="text-sm text-muted-foreground">Usunięcie konta jest nieodwracalne.</p>
        <Button variant="destructive" size="sm">Usuń konto</Button>
      </div>
    </div>
  );
}
