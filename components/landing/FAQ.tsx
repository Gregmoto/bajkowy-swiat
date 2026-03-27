"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const PYTANIA = [
  {
    pytanie: "Czy bajki są naprawdę spersonalizowane?",
    odpowiedz:
      "Tak, każda bajka jest pisana od nowa specjalnie dla Twojego dziecka. Imię dziecka, jego ulubione zwierzę, kolor i zainteresowania są wplecione w fabułę. Nie używamy szablonów — AI tworzy unikalną historię za każdym razem.",
  },
  {
    pytanie: "Jak długo trwa generowanie bajki?",
    odpowiedz:
      "Zazwyczaj bajka jest gotowa w 10–20 sekund. To tyle, ile potrzeba, żeby ułożyć dziecko do snu i wybrać motyw historii.",
  },
  {
    pytanie: "Czy treści są bezpieczne dla dzieci?",
    odpowiedz:
      "Absolutnie. Bajki są pisane z myślą o dzieciach w wieku 2–12 lat. Nie zawierają przemocy, strasznych treści ani niczego nieodpowiedniego. Każda historia kończy się szczęśliwie i niesie pozytywne przesłanie.",
  },
  {
    pytanie: "Ile bajek mogę stworzyć za darmo?",
    odpowiedz:
      "W planie darmowym możesz stworzyć 5 bajek — bez podawania karty kredytowej. To wystarczy, żeby sprawdzić, czy aplikacja przypadnie Ci do gustu. Plany płatne zaczynają się od 29 zł miesięcznie.",
  },
  {
    pytanie: "Czy mogę tworzyć bajki dla kilkorga dzieci?",
    odpowiedz:
      "Tak! Możesz dodać wiele profili dzieci i tworzyć bajki dla każdego z nich osobno. Każde dziecko ma swój własny profil z preferencjami, a biblioteka bajek jest posegregowana według dziecka.",
  },
  {
    pytanie: "Czy bajki można drukować lub exportować?",
    odpowiedz:
      "Funkcja eksportu do PDF jest w przygotowaniu. Już teraz możesz przeglądać i czytać wszystkie bajki w aplikacji. Pracujemy też nad wersją audio — bajki czytane głosem.",
  },
  {
    pytanie: "W jakim języku są bajki?",
    odpowiedz:
      "Bajki pisane są po polsku, pięknym i poprawnym językiem dopasowanym do wieku dziecka. Pracujemy nad dodaniem kolejnych języków — angielskiego i ukraińskiego.",
  },
  {
    pytanie: "Jak anulować subskrypcję?",
    odpowiedz:
      "Możesz anulować subskrypcję w dowolnym momencie z poziomu ustawień konta — bez dzwonienia, bez formularzy. Po anulowaniu zachowasz dostęp do końca opłaconego okresu.",
  },
];

export default function FAQ() {
  const [otwarty, setOtwarty] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-50/70">
      <div className="container max-w-3xl mx-auto px-6 space-y-12">
        {/* Nagłówek */}
        <div className="text-center space-y-4">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
            FAQ
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">Najczęstsze pytania</h2>
          <p className="text-slate-500 text-lg">Masz inne pytanie? Napisz do nas.</p>
        </div>

        {/* Akordeony */}
        <div className="space-y-3">
          {PYTANIA.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setOtwarty(otwarty === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                aria-expanded={otwarty === i}
              >
                <span>{item.pytanie}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    otwarty === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  otwarty === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-6 text-slate-500 leading-relaxed text-sm">
                  {item.odpowiedz}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
