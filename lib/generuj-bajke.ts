import Anthropic from "@anthropic-ai/sdk";
import { BajkaFormData } from "./validations";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MOTYWY_OPISY: Record<string, string> = {
  przygoda:
    "przygodowy — pełen nieoczekiwanych zdarzeń, odkryć i ekscytujących wyzwań",
  magia:
    "magiczny — z czarami, zaklęciami, cudownymi mocami i tajemniczymi stworzeniami",
  przyjazn:
    "o przyjaźni — ukazujący siłę prawdziwej przyjaźni, wzajemnej pomocy i lojalności",
  zwierzeta:
    "ze zwierzętami — gdzie zwierzęta mówią, mają własne przygody i uczą się ważnych lekcji",
  kosmos:
    "kosmiczny — w rozległej przestrzeni kosmicznej, z planetami, gwiazdami i kosmiczną przygodą",
};

export interface GenerujBajkeOutput {
  tytul: string;
  tresc: string;
}

export async function generujBajke(
  input: BajkaFormData
): Promise<GenerujBajkeOutput> {
  const plecLabel =
    input.plec === "chlopiec" ? "chłopiec" : "dziewczynka";
  const motywOpis = MOTYWY_OPISY[input.motyw] || input.motyw;

  const linie: string[] = [
    "Jesteś mistrzowskim autorem bajek dla dzieci. Napisz piękną, spersonalizowaną bajkę w języku polskim.",
    "",
    "=== INFORMACJE O BOHATERZE ===",
    `Imię: ${input.imie}`,
    `Wiek: ${input.wiek} lat`,
    `Płeć: ${plecLabel}`,
  ];

  if (input.ulubZwierze) linie.push(`Ulubione zwierzę: ${input.ulubZwierze}`);
  if (input.ulubKolor) linie.push(`Ulubiony kolor: ${input.ulubKolor}`);
  if (input.ulubZabawka)
    linie.push(`Ulubiona zabawka lub przedmiot: ${input.ulubZabawka}`);

  linie.push("");
  linie.push("=== BAJKA ===");
  linie.push(`Motyw: ${motywOpis}`);

  if (input.moral) linie.push(`Morał do przekazania: ${input.moral}`);
  if (input.dodatkowe)
    linie.push(`Dodatkowe elementy do uwzględnienia: ${input.dodatkowe}`);

  linie.push("");
  linie.push("=== WYMAGANIA ===");
  linie.push(`1. ${input.imie} jest GŁÓWNYM bohaterem/bohaterką bajki`);
  linie.push(
    `2. Bajka jest odpowiednia dla dziecka w wieku ${input.wiek} lat (prosty, żywy język)`
  );
  linie.push("3. Długość: 550–750 słów");
  linie.push(
    "4. Bajka ma wyraźny początek, rozwinięcie (wyzwanie/problem) i szczęśliwe zakończenie"
  );
  linie.push(
    "5. Narracja jest angażująca, pełna emocji i opisów — jak prawdziwa opowieść"
  );
  if (input.ulubZwierze || input.ulubKolor || input.ulubZabawka) {
    linie.push(
      "6. Włącz elementy preferencji bohatera naturalnie w fabułę bajki"
    );
  }
  linie.push("");
  linie.push(
    "Odpowiedz WYŁĄCZNIE w formacie JSON (bez żadnego dodatkowego tekstu przed ani po):"
  );
  linie.push('{"tytul": "TYTUŁ BAJKI", "tresc": "PEŁNA TREŚĆ BAJKI"}');
  linie.push("");
  linie.push(
    "W treści bajki: akapity oddzielaj znakiem \\n\\n, nie używaj markdown ani HTML."
  );

  const prompt = linie.join("\n");

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const response = await stream.finalMessage();

  const textBlock = response.content.find(
    (b: Anthropic.ContentBlock): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Brak treści tekstowej w odpowiedzi modelu");
  }

  let jsonText = textBlock.text.trim();

  // Usuń ewentualne bloki markdown (```json ... ```)
  if (jsonText.startsWith("```")) {
    jsonText = jsonText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  let parsed: { tytul: string; tresc: string };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Nie udało się przetworzyć odpowiedzi modelu jako JSON: ${jsonText.slice(0, 200)}`
    );
  }

  if (!parsed.tytul || !parsed.tresc) {
    throw new Error("Odpowiedź modelu nie zawiera wymaganych pól (tytul, tresc)");
  }

  return {
    tytul: parsed.tytul,
    tresc: parsed.tresc,
  };
}
