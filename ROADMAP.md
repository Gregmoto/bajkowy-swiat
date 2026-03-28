# Bajkowy Świat — Roadmap produktu

## Wizja produktu

Bajkowy Świat to platforma do generowania spersonalizowanych bajek dla dzieci.
Cel: stać się **domowym lektorem AI** — jedynym miejscem, gdzie rodzic w 2 minuty
tworzy bajkę na dobranoc, dostosowaną do imienia, wieku i zainteresowań dziecka,
z możliwością odsłuchania jej głosem AI i wydrukowania jako piękna ilustrowana książeczka.

---

## Faza 1 — MVP (obecny stan + brakujące minimum)

> Cel: produkt gotowy do sprzedaży. Prosty, niezawodny, z jasną propozycją wartości.

### ✅ Już gotowe

- Rejestracja i logowanie (JWT, bcrypt)
- Profile dzieci (imię, wiek, płeć, zainteresowania, avatar)
- Generator bajek (lokalny + Anthropic Claude)
- Biblioteka bajek z filtrowaniem
- Edycja i usuwanie bajek
- Subskrypcja FREE (model danych)
- Middleware ochrony tras

### 🔲 Do ukończenia w MVP

#### Płatności — Stripe (podstawowe)

- Integracja Stripe Checkout
- Dwa plany: **Starter** (20 zł/mies.) i **Premium** (49 zł/mies.)
- Webhook do aktualizacji statusu subskrypcji w DB
- Strona `/ustawienia/subskrypcja` z aktualnym planem i przyciskiem upgrade
- Limit bajek per plan egzekwowany w Server Action (sprawdzenie `storiesThisMonth`)

#### Onboarding użytkownika

- Ekran powitalny po rejestracji (3 kroki: "Witaj → Dodaj dziecko → Stwórz bajkę")
- Tooltip/hint na pustym dashboardzie ("Zacznij od dodania profilu dziecka →")
- Email powitalny (Resend.com, szablon HTML)

#### Eksport PDF — wersja podstawowa

- Biblioteka: `@react-pdf/renderer`
- Prosty layout: tytuł + treść + morał na A4 lub A5
- Przycisk "Pobierz PDF" w widoku bajki
- PDF generowany server-side (Route Handler `/api/bajki/[id]/pdf`)

#### Konto użytkownika

- Zmiana imienia i adresu e-mail
- Zmiana hasła (stare → nowe)
- Usunięcie konta (RODO — kaskadowe usuwanie danych)

#### SEO i meta

- `generateMetadata()` dla stron dynamicznych
- OpenGraph dla strony głównej
- `robots.txt` + `sitemap.xml`

---

## Faza 2 — V2 (kwartał 2)

> Cel: wzrost retencji, wyróżnienie się na tle konkurencji, pierwsze viralowe funkcje.

### Ilustracje AI

**Stack**: Replicate API (SDXL / Flux) lub OpenAI DALL-E 3

- Generowanie 1 ilustracji okładki na bajkę (format 16:9 lub kwadrat)
- Styl graficzny: akwarela, bajkowy, pastelowy (prompt system)
- Ilustracje w widoku bajki + w eksporcie PDF
- Cache ilustracji w Cloudflare R2 / Vercel Blob (nie generuj dwa razy)
- W planie FREE: bajkowa ilustracja generyczna (bez AI), w STARTER/PREMIUM: personalizowana

**Implementacja**:
```
POST /api/bajki/[id]/ilustracja
→ wywołuje Replicate z promptem opartym na tytule + temacie + morale
→ zapisuje URL w Story.coverImage
→ invaliduje cache strony bajki
```

### Audiobook / Lektor

**Stack**: ElevenLabs API lub OpenAI TTS (`tts-1-hd`)

- Synteza mowy z tekstu bajki
- Dwa głosy do wyboru: ciepły kobiecy + spokojny męski (po polsku)
- Odtwarzacz audio w widoku bajki (play/pause/seekbar)
- Plik MP3 cachowany w Vercel Blob
- Limit: 1 audiobook/miesiąc w STARTER, nielimitowany w PREMIUM

**Implementacja**:
```
POST /api/bajki/[id]/audio
→ dzieli tekst na akapity (max 4096 znaków per request)
→ OpenAI TTS stream → konkatenacja → MP3 upload do Blob
→ zapisuje URL w Story.audioUrl (nowe pole w schemacie)
```

### Eksport PDF — wersja rozszerzona

- Ilustrowany layout z okładką (ilustracja AI na stronie 1)
- Typografia: przyjazna, czytelna czcionka (np. Nunito / Lato)
- Stopka z imieniem dziecka i datą
- Opcja: A4 pionowy lub A5 (format książeczki)
- Opcja: wydruk dwustronny (marginesy lustrzane)

### Wielojęzyczność

**Stack**: `next-intl` lub `i18next`

- Języki interfejsu: PL (domyślny), EN, DE (najpopularniejsze rynki)
- Bajki generowane w wybranym języku (`Story.language` już jest w schemacie)
- Routing: `/pl/`, `/en/`, `/de/` lub `Accept-Language` header
- Tłumaczenia: JSON locale files (`messages/pl.json`, `messages/en.json`)
- Generator promptów zbudowany dla każdego języka osobno

### Udostępnianie bajek

- Unikalny publiczny link: `/bajka/[shareToken]` (bez logowania)
- Bajka udostępniona zawiera: tytuł, treść, morał — bez danych autora
- Przycisk "Udostępnij" generuje token (SHA256 z `story.id + secret`)
- Opcja wycofania linku (reset tokena)
- OG Image generowany dynamicznie dla linku (Next.js `ImageResponse`)

### Ulubione i organizacja

- Serduszko "dodaj do ulubionych" (już jest `StoryLike` w schemacie)
- Filtr "tylko ulubione" w bibliotece
- Kolekcje / foldery (np. "Bajki na noc", "Seria o smoku")
- Drag & drop kolejności w kolekcji

---

## Faza 3 — V3 (kwartał 3–4)

> Cel: platforma, nie tylko narzędzie. Skalowanie, monetyzacja premium, B2B.

### Panel administracyjny

**Dostęp**: `role: ADMIN` w bazie + trasa `/admin` chroniona middleware

**Moduły**:

| Moduł | Zawartość |
|---|---|
| Dashboard | Liczba użytkowników, bajek, przychód MRR, retencja 30d |
| Użytkownicy | Lista, filtrowanie, blokowanie, zmiana planu, podgląd bajek |
| Bajki | Wszystkie bajki, wyszukiwanie, podgląd treści, ręczna moderacja |
| Subskrypcje | Aktywne plany, churny, przychód per plan |
| Moderacja | Kolejka bajek do przeglądu, oznaczanie jako OK/zablokowana |
| Logi | AuditLog viewer z filtrowaniem po akcji/użytkowniku/dacie |

**Stack**: osobna grupa route `app/(admin)/admin/` z własnym layoutem

### Moderacja treści

- Auto-moderacja przy generowaniu (Anthropic Moderation API lub prompt guard)
- Prompt injection detection: lista zakazanych fraz w polach kreatora
- Bajki z flagą `needsReview: true` trafiają do kolejki admina
- Admin może: zatwierdzić / zablokować / edytować / usunąć
- E-mail do użytkownika gdy bajka zablokowana (z ogólnym powodem)
- Content policy wyświetlana przy tworzeniu konta

### Analityka

**Stack**: PostHog (self-hosted lub cloud) + własne eventy

**Eventy do śledzenia**:
```
user.registered, user.logged_in, user.churned
story.created, story.viewed, story.downloaded_pdf, story.shared
audio.played, audio.completed
subscription.upgraded, subscription.canceled
kreator.step_1_completed ... kreator.submitted
```

**Dashboardy**:
- Activation funnel (rejestracja → pierwsze dziecko → pierwsza bajka)
- Retention (D1, D7, D30)
- Feature adoption (% użytkowników używa audio, PDF, ilustracji)
- Revenue: MRR, ARPU, LTV

### Subskrypcja — pełna implementacja

| Plan | Cena | Limity | Funkcje |
|---|---|---|---|
| FREE | 0 zł | 3 bajki/mies., 1 dziecko | Generator podstawowy |
| STARTER | 19 zł/mies. | 20 bajek/mies., 3 dzieci | PDF, ilustracje generyczne |
| PREMIUM | 49 zł/mies. | Nielimitowane, 10 dzieci | Ilustracje AI, audio, udostępnianie |
| Rodzinny | 79 zł/mies. | Nielimitowane, 20 dzieci | Wszystko + priorytet generowania |

**Stripe**:
- Checkout Session (one-time checkout flow)
- Customer Portal (samodzielna zmiana planu, anulowanie)
- Webhooks: `customer.subscription.updated`, `invoice.payment_failed`
- Prorated upgrade/downgrade
- Okres próbny 7 dni dla STARTER

### Onboarding — wersja rozszerzona

- Interaktywny tour (Shepherd.js lub niestandardowy)
- Progress bar "Ukończ profil" (zdjęcie, zainteresowania, notatki)
- E-mail sekwencja (Resend): D1 "Stwórz pierwszą bajkę", D3 "Spróbuj audio", D7 "Zaproszenie do premium"
- Push notyfikacje (Web Push API) — opcjonalne

### B2B — Przedszkola i biblioteki

- Konto organizacji z wieloma opiekunami
- Wspólna biblioteka bajek dla grupy
- Panel managera grupy (dodawanie/usuwanie opiekunów)
- Faktura VAT zamiast paragonu
- Cennik B2B (negocjowany, min. 10 kont)

### Aplikacja mobilna (React Native / Expo)

- Port kluczowych ekranów: kreator, biblioteka, odtwarzacz audio
- Offline: bajki i audio dostępne bez internetu (SQLite + pliki)
- Powiadomienia push: "Czas na bajkę na dobranoc 🌙"
- Widget iOS/Android: ostatnia bajka, szybki start kreatora

---

## Priorytety techniczne (cross-cutting)

### Wydajność

- ISR (Incremental Static Regeneration) dla strony głównej
- Streaming Server Components dla długich treści bajek
- `React.Suspense` + Skeleton loading wszędzie
- Cloudflare CDN dla plików statycznych i audio

### Bezpieczeństwo

- Rate limiting na API (Upstash Redis)
- CSRF protection dla formularzy
- Content Security Policy headers (middleware)
- Automatyczny audit log wszystkich akcji mutujących dane
- Szyfrowanie PII w bazie (imiona dzieci) — opcjonalne dla V3

### Infrastruktura

- Vercel (hosting Next.js)
- Neon PostgreSQL (baza danych)
- Vercel Blob lub Cloudflare R2 (pliki: PDF, audio, ilustracje)
- Upstash Redis (rate limiting, cache)
- Resend (e-maile transakcyjne)
- PostHog (analityka)
- Stripe (płatności)

---

## Harmonogram

```
Q1 2026 — MVP
  ├── Stripe (podstawowe płatności)
  ├── Eksport PDF (prosty layout)
  ├── Onboarding (3 kroki)
  └── Konto użytkownika (zmiana danych, usunięcie)

Q2 2026 — V2
  ├── Ilustracje AI (Replicate/DALL-E)
  ├── Audiobook (OpenAI TTS)
  ├── PDF z ilustracjami
  ├── Wielojęzyczność (PL + EN)
  └── Udostępnianie bajek

Q3 2026 — V3 (część 1)
  ├── Panel admina
  ├── Moderacja treści
  ├── Analityka (PostHog)
  └── Stripe pełna implementacja + Customer Portal

Q4 2026 — V3 (część 2)
  ├── Onboarding rozszerzony + e-mail sekwencje
  ├── B2B (przedszkola)
  └── Aplikacja mobilna (Expo) — MVP
```

---

## Metryki sukcesu

| Faza | KPI | Cel |
|---|---|---|
| MVP | Rejestracje | 500 w pierwszym miesiącu |
| MVP | Konwersja FREE→STARTER | 5% |
| V2 | Retencja D30 | >40% |
| V2 | MRR | 5 000 zł |
| V3 | MRR | 25 000 zł |
| V3 | Churn miesięczny | <5% |
