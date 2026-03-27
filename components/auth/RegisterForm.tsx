"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Formularz rejestracji — imię, email, hasło, potwierdzenie hasła
export default function RegisterForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utwórz konto</CardTitle>
        <CardDescription>Zarejestruj się i twórz bajki dla swoich dzieci.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Imię i nazwisko</Label>
          <Input id="name" placeholder="Jan Kowalski" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="twoj@email.pl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" placeholder="Minimum 8 znaków" />
        </div>
        <Button className="w-full">Zarejestruj się</Button>
        <p className="text-center text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
