"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Formularz logowania — email + hasło, link do rejestracji i resetu hasła
export default function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zaloguj się</CardTitle>
        <CardDescription>Podaj swoje dane, aby wejść do Bajkowego Świata.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="twoj@email.pl" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Hasło</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Zapomniałeś hasła?
            </Link>
          </div>
          <Input id="password" type="password" />
        </div>
        <Button className="w-full">Zaloguj się</Button>
        <p className="text-center text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
