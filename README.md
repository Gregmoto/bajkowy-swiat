# 🌟 Bajkowy Świat

Aplikacja do generowania spersonalizowanych bajek dla dzieci. Rodzic tworzy profil dziecka (imię, wiek, zainteresowania), wybiera temat i ton opowieści, a aplikacja generuje unikalną bajkę dopasowaną do dziecka.

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Język | TypeScript |
| Baza danych | PostgreSQL — [Neon](https://neon.tech) |
| ORM | Prisma 5 |
| Autentykacja | JWT (jose) + bcryptjs |
| Walidacja | Zod + React Hook Form |
| Stylowanie | Tailwind CSS + Radix UI |
| AI | Anthropic Claude (opcjonalne) |
| Deployment | Vercel |

---

## Wymagania wstępne

- **Node.js** 18.17 lub nowszy (`node --version`)
- **npm** 9+ lub pnpm/yarn
- Konto na [Neon](https://neon.tech) (darmowy tier wystarczy)
- Opcjonalnie: klucz API [Anthropic](https://console.anthropic.com) (bez niego działa generator lokalny)

---

## Instalacja krok po kroku

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/twoj-login/bajkowy-swiat.git
cd bajkowy-swiat
```

### 2. Zainstaluj zależności

```bash
npm install
```

`postinstall` automatycznie uruchamia `prisma generate`.

### 3. Skonfiguruj zmienne środowiskowe

```bash
cp .env.example .env.local
```

Otwórz `.env.local` i uzupełnij wartości (szczegóły poniżej).

### 4. Skonfiguruj bazę danych

```bash
# Zastosuj schemat do bazy danych
npx prisma db push

# lub użyj migracji (zalecane na produkcji):
npx prisma migrate dev --name init
```

### 5. Załaduj dane testowe (opcjonalne)

```bash
npx prisma db seed
```

### 6. Uruchom aplikację

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

---

## Konfiguracja zmiennych środowiskowych

Skopiuj `.env.example` do `.env.local` i wypełnij:

### `DATABASE_URL` — URL poolera Neon

Pobierz z panelu Neon: **Connection Details → Pooled connection**

```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### `DIRECT_URL` — bezpośredni URL Neon

Pobierz z panelu Neon: **Connection Details → Direct connection**
Używany przez `prisma migrate` i `prisma db push`.

```
DIRECT_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### `NEXTAUTH_SECRET` — sekret JWT

Wygeneruj bezpieczny sekret:

```bash
openssl rand -base64 32
```

```
NEXTAUTH_SECRET="wklej-tu-wygenerowany-sekret"
```

### `NEXTAUTH_URL` — URL aplikacji

```
# Lokalnie:
NEXTAUTH_URL="http://localhost:3000"

# Na Vercel (ustaw w panelu Vercel, nie tu):
# NEXTAUTH_URL="https://bajkowy-swiat.vercel.app"
```

### `ANTHROPIC_API_KEY` — opcjonalne

```
ANTHROPIC_API_KEY="sk-ant-..."
```

Bez tego klucza aplikacja korzysta z wbudowanego generatora lokalnego.

---

## Skrypty npm

```bash
npm run dev          # Serwer deweloperski (localhost:3000)
npm run build        # Zbuduj do produkcji (prisma generate + next build)
npm run start        # Uruchom zbudowaną aplikację
npm run lint         # Sprawdź kod ESLint

npx prisma studio        # GUI do przeglądania bazy danych
npx prisma db push       # Zsynchronizuj schemat z DB (bez migracji)
npx prisma migrate dev   # Utwórz i zastosuj migrację (dev)
npx prisma migrate deploy # Zastosuj migracje (produkcja)
npx prisma db seed       # Załaduj dane testowe
npx prisma generate      # Wygeneruj klienta Prisma
```

---

## Uruchomienie lokalne — szczegóły

### Baza danych

Projekt używa **Neon PostgreSQL** — serverless Postgres w chmurze z darmowym tierem.

1. Zaloguj się na [console.neon.tech](https://console.neon.tech)
2. Utwórz nowy projekt (np. `bajkowy-swiat`)
3. Skopiuj **Pooled connection string** → `DATABASE_URL`
4. Skopiuj **Direct connection string** → `DIRECT_URL`

### Pierwsze uruchomienie

```bash
# 1. Utwórz tabele w bazie
npx prisma migrate dev --name init

# 2. Załaduj przykładowe dane
npx prisma db seed

# 3. Uruchom serwer
npm run dev
```

Dane testowe:
- Email: `test@bajkowyswiat.pl`
- Hasło: `Test1234!`

---

## Migracje Prisma

### Środowisko deweloperskie

```bash
# Edytuj prisma/schema.prisma, potem:
npx prisma migrate dev --name nazwa-migracji
```

Tworzy plik w `prisma/migrations/` i stosuje zmiany do DB.

### Środowisko produkcyjne (Vercel)

```bash
npx prisma migrate deploy
```

Stosuje wszystkie nieaplikowane migracje. Uruchamiane automatycznie w build command na Vercel (patrz niżej).

### Resetowanie bazy (tylko dev!)

```bash
npx prisma migrate reset   # UWAGA: usuwa wszystkie dane!
npx prisma db seed         # Przywróć dane testowe
```

---

## Struktura projektu

```
bajkowy-swiat/
├── app/                    # Next.js App Router
│   ├── (app)/              # Chronione trasy (wymagają logowania)
│   │   ├── biblioteka/     # Lista i szczegóły bajek
│   │   ├── dashboard/      # Pulpit użytkownika
│   │   ├── dzieci/         # Profile dzieci
│   │   ├── kreator/        # Generator bajek
│   │   └── ustawienia/     # Konto i subskrypcja
│   ├── (auth)/             # Logowanie i rejestracja
│   ├── (landing)/          # Strona główna (publiczna)
│   └── api/                # API Routes
├── components/             # Komponenty React
│   ├── auth/               # Formularze logowania/rejestracji
│   ├── biblioteka/         # Karty i szczegóły bajek
│   ├── dashboard/          # Widgety pulpitu
│   ├── dzieci/             # Formularze profili dzieci
│   ├── kreator/            # Kreator bajek (multi-step)
│   ├── landing/            # Sekcje strony głównej
│   └── ui/                 # Komponenty bazowe (shadcn/ui)
├── lib/
│   ├── actions/            # Server Actions (bajka, dziecko, kreator)
│   ├── auth/               # Sesja JWT, haszowanie hasła, walidacje
│   ├── generator/          # Lokalny generator bajek
│   ├── utils/              # Pomocnicze funkcje (db-error, cn)
│   └── validators/         # Schematy Zod
├── prisma/
│   ├── migrations/         # Historia migracji (commitowane!)
│   ├── schema.prisma       # Schemat bazy danych
│   └── seed.ts             # Dane testowe
├── middleware.ts            # Ochrona tras (JWT middleware)
├── next.config.mjs
└── .env.example            # Szablon zmiennych środowiskowych
```

---

## Wdrożenie na Vercel

### Krok 1 — Przygotuj repozytorium

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Krok 2 — Utwórz projekt na Vercel

1. Otwórz [vercel.com](https://vercel.com) → **Add New Project**
2. Importuj repozytorium z GitHub
3. Framework: **Next.js** (wykryty automatycznie)

### Krok 3 — Skonfiguruj zmienne środowiskowe na Vercel

W panelu projektu: **Settings → Environment Variables**

| Zmienna | Wartość | Środowisko |
|---|---|---|
| `DATABASE_URL` | Pooled connection (Neon) | Production, Preview, Development |
| `DIRECT_URL` | Direct connection (Neon) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Wynik `openssl rand -base64 32` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://twoja-domena.vercel.app` | Production |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (opcjonalne) | Production, Preview |

> ⚠️ `NEXTAUTH_URL` na produkcji musi być Twoją domeną Vercel, **nie** localhost.

### Krok 4 — Ustaw Build Command

W **Settings → General → Build & Output Settings**:

```
Build Command: npx prisma migrate deploy && next build
```

Lub jeśli nie korzystasz z migracji:

```
Build Command: npx prisma generate && next build
```

> Skrypt `postinstall` w `package.json` uruchamia `prisma generate` automatycznie po `npm install`.

### Krok 5 — Deploy

Kliknij **Deploy** lub pushuj do `main` — Vercel zbuduje automatycznie.

---

## Dane testowe (seed)

Plik `prisma/seed.ts` tworzy:

| Typ | Dane |
|---|---|
| Użytkownik | `test@bajkowyswiat.pl` / `Test1234!` |
| Subskrypcja | FREE (3 bajki w tym miesiącu) |
| Dzieci | Zosia (5 lat, 🧚) + Marek (8 lat, 🦁) |
| Bajka 1 | „Zosia i Zaczarowany Las" — MAGIC, PUBLISHED |
| Bajka 2 | „Marek i Smokowy Skarb" — ADVENTURE, PUBLISHED |
| Bajka 3 | „Zosia i Zagubiona Gwiazdka" — SPACE, DRAFT |

```bash
# Uruchom seed:
npx prisma db seed

# Lub przez npm:
npm run db:seed   # (jeśli dodano do scripts)
```

---

## Bezpieczeństwo

- Hasła hashowane bcryptjs (12 rund)
- Sesje JWT (HS256, 7 dni, HttpOnly cookie)
- Middleware weryfikuje token na każdym chronionym route
- Wygasłe tokeny automatycznie usuwane z cookies
- Wszystkie akcje serwera weryfikują własność zasobu (userId)
- Błędy bazy danych mapowane na bezpieczne komunikaty (bez raw SQL errors)
- `NEXTAUTH_SECRET` minimum 32 znaki losowe

---

## Checklista wdrożeniowa — Vercel + Neon

Wykonaj kroki w tej kolejności przed pierwszym deployem:

### Baza danych (Neon)

- [ ] Utwórz projekt na [neon.tech](https://neon.tech)
- [ ] Skopiuj **Pooled connection string** → `DATABASE_URL`
- [ ] Skopiuj **Direct connection string** → `DIRECT_URL`
- [ ] Lokalnie: `npx prisma migrate dev --name init` (tworzy tabele)
- [ ] Opcjonalnie: `npx prisma db seed` (dane testowe)

### Repozytorium GitHub

- [ ] `git init && git add . && git commit -m "Initial commit"`
- [ ] Utwórz repozytorium na GitHub (prywatne lub publiczne)
- [ ] `git remote add origin https://github.com/login/repo.git`
- [ ] `git push -u origin main`
- [ ] Sprawdź: `.env` i `.env.local` **nie są** w repo (gitignore)
- [ ] Sprawdź: `prisma/migrations/` **jest** w repo

### Vercel — konfiguracja projektu

- [ ] Zaloguj się na [vercel.com](https://vercel.com) → **Add New Project**
- [ ] Importuj repozytorium z GitHub
- [ ] Framework: **Next.js** (wykryty automatycznie)
- [ ] Root Directory: `.` (korzeń projektu)

### Vercel — zmienne środowiskowe

W **Settings → Environment Variables** dodaj:

- [ ] `DATABASE_URL` = pooler URL z Neon (ze `channel_binding=require`)
- [ ] `DIRECT_URL` = direct URL z Neon (bez `-pooler`)
- [ ] `NEXTAUTH_SECRET` = wynik `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` = `https://twoja-domena.vercel.app`
- [ ] `ANTHROPIC_API_KEY` = klucz Anthropic (jeśli używasz AI)

> Upewnij się, że wszystkie zmienne mają zaznaczone: **Production**, **Preview**, **Development**

### Vercel — Build Command

W **Settings → General → Build & Output Settings**:

- [ ] Build Command: `npx prisma migrate deploy && next build`
- [ ] Output Directory: `.next` (domyślnie)
- [ ] Install Command: `npm install` (domyślnie)

> `postinstall` w `package.json` uruchamia `prisma generate` po `npm install` — nie musisz tego dodawać.

### Deploy i weryfikacja

- [ ] Kliknij **Deploy** (lub push do `main`)
- [ ] Sprawdź logi build — szukaj `✅ Generated Prisma Client` i `✓ Compiled successfully`
- [ ] Sprawdź: `https://twoja-domena.vercel.app/` — strona główna ładuje się
- [ ] Sprawdź: `https://twoja-domena.vercel.app/login` — formularz logowania działa
- [ ] Zaloguj się danymi testowymi: `test@bajkowyswiat.pl` / `Test1234!`
- [ ] Sprawdź: `/dashboard` — dane z bazy widoczne
- [ ] Sprawdź: `/biblioteka` — bajki z seeda widoczne

### Bezpieczeństwo przed publicznym launchem

- [ ] Zmień `NEXTAUTH_SECRET` na unikalny (nie używaj domyślnego)
- [ ] Zmień hasło użytkownika testowego lub usuń konto seed
- [ ] Ustaw `NEXTAUTH_URL` na właściwą domenę produkcyjną
- [ ] Sprawdź, czy błędy DB nie ujawniają szczegółów (mapDbError)
- [ ] Upewnij się, że cookies są `httpOnly: true, secure: true` (sesja.ts)

---

## Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.
