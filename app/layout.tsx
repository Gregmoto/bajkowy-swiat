import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nawigacja from "@/components/Nawigacja";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Bajkowy Świat — Spersonalizowane bajki dla dzieci",
  description:
    "Twórz magiczne, spersonalizowane bajki, w których Twoje dziecko jest głównym bohaterem. Wygenerowane przez AI bajki w języku polskim.",
  keywords: [
    "bajki dla dzieci",
    "spersonalizowane bajki",
    "bajki po polsku",
    "AI bajki",
    "dziecko bohater",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bajkowe-tlo min-h-screen`}>
        <Nawigacja />
        <main className="container py-8">{children}</main>
        <footer className="border-t py-6 mt-8">
          <div className="container text-center text-sm text-muted-foreground">
            <p>
              ✨ Bajkowy Świat — Magiczne bajki tworzone przez AI dla Twojego
              dziecka
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
