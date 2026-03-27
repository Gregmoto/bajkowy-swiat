import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-sans",
});

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
      <body className={`${lato.variable} font-sans snippsnapp-bg`}>
        {children}
      </body>
    </html>
  );
}
