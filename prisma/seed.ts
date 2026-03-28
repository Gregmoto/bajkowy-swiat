import { PrismaClient, Gender, StoryTheme, StoryStatus, SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Dane testowe
// ---------------------------------------------------------------------------
const TEST_EMAIL = "test@bajkowyswiat.pl";
const TEST_PASSWORD = "Test1234!"; // spełnia: 8+ znaków, wielka, cyfra, znak spec.

// ---------------------------------------------------------------------------
// Treści bajek po polsku
// ---------------------------------------------------------------------------
const BAJKA_1_TRESC = `Dawno, dawno temu, na skraju wielkiego lasu, mieszkała pięcioletnia dziewczynka o imieniu Zosia. Miała długie jasne warkocze i oczy koloru nieba. Najbardziej na świecie kochała kwiaty i zwierzęta.

Pewnego wiosennego ranka Zosia wyruszył na spacer po lesie. Była już blisko polany, gdy nagle zobaczyła coś niezwykłego — mały różowy kwiat świecił jak lampion wśród zielonych traw.

— Hej! — odezwał się kwiatek cienkim, dźwięcznym głosem. — Szukam dziecka o dobrym sercu. Czy to ty?

Zosia przysiadła obok kwiatu i powiedziała: — Staram się być dobra każdego dnia.

— W takim razie — uśmiechnął się kwiatek — chcę ci pokazać nasz zaczarowany las.

Nagle drzewa rozstąpiły się jak kurtyna, a oczom Zosi ukazała się polana pełna barwnych motyli, śpiewających kwiatów i małych, złotych wróżek.

— Witaj w Zaczarowanym Lesie! — chórem zawołały wróżki. — Każdy, kto tu wchodzi z czystym sercem, może spełnić jedno życzenie.

Zosia pomyślała chwilę i powiedziała: — Życzę sobie, żeby wszystkie chore zwierzęta w naszym lesie wróciły do zdrowia.

Wróżki zaśpiewały i rozbłysły złotymi iskrami. Z oddali dobiegł radosny rechot żab i szczebiot ptaków.

— Twoje życzenie spełnione — powiedziała najstarsza wróżka. — A w nagrodę za bezinteresowność otrzymasz ten magiczny kamyczek. Kiedy będziesz potrzebować pomocy, wystarczy, że go ściśniesz.

Zosia wróciła do domu z różowym kamyczkiem w dłoni i ogromnym uśmiechem na twarzy. Od tej pory wiedziała, że odwaga i dobroć otwierają drzwi do cudów.`;

const BAJKA_1_OPIS =
  "Zosia odkrywa zaczarowany las, gdzie drzewa mówią, a kwiatki śpiewają. Dowiaduje się, że bezinteresowna dobroć jest najpotężniejszą magią na świecie.";

const BAJKA_2_TRESC = `Marek miał osiem lat i całe życie marzył o przygodzie. Pewnego dnia w starym pudełku po butach znalazł wyblakłą mapę z narysowanym smokiem i napisem: „Tu leży skarb".

— Tato! — krzyknął Marek. — To musi być prawdziwa mapa skarbów!

Ojciec spojrzał poważnie i powiedział: — Jeśli chcesz, możemy poszukać razem. Ale pamiętaj, prawdziwe przygody wymagają odwagi.

Następnego ranka Marek z ojcem wyruszyli w las za domem. Mapa prowadziła przez strumień, pod starą jodłą i dalej, na skalistą górkę. Po drodze Marek musiał przeskoczyć przez rwący potok i wspiąć się po śliskich kamieniach.

— Nie poddaję się — mruknął pod nosem, choć kolana mu się trzęsły.

Na szczycie górki znaleźli kamienną skrzynkę. Marek otworzył ją drżącymi rękami. W środku leżało pięć złotych monet i karteczka:

„Skarb to nie złoto. Skarb to odwaga, by szukać, i ktoś bliski, z kim możesz dzielić przygodę."

Marek spojrzał na ojca i uśmiechnął się szeroko. Rozumiał teraz wszystko.

Wrócili do domu trzymając się za ręce, a wieczorem mama upiekła szarlotkę na świętowanie. Złote monety powędrowały do skarbonki Marka — na następną wyprawę.`;

const BAJKA_2_OPIS =
  "Marek odnajduje tajemniczą mapę i wyrusza z tatą na poszukiwanie smoczego skarbu. Przekonuje się, że prawdziwy skarb to odwaga i czas spędzony z bliskimi.";

const BAJKA_3_TRESC = `Zosia zawsze patrzyła w niebo i liczyła gwiazdy przed snem. Pewnej nocy przez okno jej pokoju wleciała mała, mrugająca iskierka.

— Pomocy — powiedziała iskierka płaczliwym głosem. — Jestem Gwiazdką Polaris i zgubiłam się wracając do domu.

Zosia usiadła na łóżku z szeroko otwartymi oczami. — Nie bój się. Pomogę ci!

Wzięła latarkę i wyszła do ogrodu. Razem z Gwiazdką patrzyły w niebo.

— Tam jest Wielka Niedźwiedzica — powiedziała Zosia, wskazując palcem. — Jej ogon wskazuje zawsze na północ. Twój dom jest właśnie tam!`;

const BAJKA_3_OPIS =
  "Zosia pomaga zagubionej gwiazdce odnaleźć drogę do domu, ucząc się przy okazji, jak odnajdywać kierunki na nocnym niebie.";

// ---------------------------------------------------------------------------
// Główna funkcja seeda
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱 Uruchamianie seeda bazy danych…\n");

  // ── 0. Wyczyść stare dane seed ────────────────────────────────────────────
  console.log("🧹 Czyszczenie starych danych seed…");
  await prisma.user.deleteMany({
    where: { id: { in: ["seed-user-001", "seed-admin-001"] } },
  });

  // ── 1. Użytkownik testowy ──────────────────────────────────────────────────
  console.log("👤 Tworzenie użytkownika testowego…");
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      id: "seed-user-001",
      email: TEST_EMAIL,
      name: "Anna Kowalska",
      passwordHash,
      role: "USER",
    },
  });

  // ── 2. Subskrypcja FREE ────────────────────────────────────────────────────
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: SubscriptionPlan.FREE,
      storiesThisMonth: 3,
    },
  });

  // ── 3. Profile dzieci ──────────────────────────────────────────────────────
  console.log("👧👦 Tworzenie profili dzieci…");

  const zosia = await prisma.childProfile.create({
    data: {
      id: "seed-profil-zosia",
      userId: user.id,
      name: "Zosia",
      age: 5,
      gender: Gender.GIRL,
      avatar: "🧚",
      interests: ["Przyroda", "Zwierzęta", "Bajki", "Taniec"],
      favoriteColor: "różowy",
      favoriteAnimal: "jednorożec",
      notes: "Uwielbia wróżki i magiczne opowieści. Boi się burzy.",
    },
  });

  const marek = await prisma.childProfile.create({
    data: {
      id: "seed-profil-marek",
      userId: user.id,
      name: "Marek",
      age: 8,
      gender: Gender.BOY,
      avatar: "🦁",
      interests: ["Sport", "Kosmos", "Dinozaury", "Roboty"],
      favoriteColor: "niebieski",
      favoriteAnimal: "smok",
      notes: "Uwielbia przygody i zagadki. Chce zostać astronautą.",
    },
  });

  // ── 4. Bajki ───────────────────────────────────────────────────────────────
  console.log("📖 Tworzenie bajek…");

  // Bajka 1 — Zosia, MAGIC, PUBLISHED
  const bajka1 = await prisma.story.create({
    data: {
      id: "seed-bajka-001",
      userId: user.id,
      childProfileId: zosia.id,
      title: "Zosia i Zaczarowany Las",
      theme: StoryTheme.MAGIC,
      status: StoryStatus.PUBLISHED,
      summary: BAJKA_1_OPIS,
      content: BAJKA_1_TRESC,
      moral: "Dobroć i odwaga otwierają drzwi do cudów.",
      extra: JSON.stringify({ ton: "MAGICZNA", dlugosc: "MEDIUM", tematWyswietlany: "Magia", dodatkowe: null }),
    },
  });

  await prisma.storyVersion.create({
    data: {
      storyId: bajka1.id,
      version: 1,
      content: BAJKA_1_TRESC,
      modelId: "local-generator-v1",
    },
  });

  // Bajka 2 — Marek, ADVENTURE, PUBLISHED
  const bajka2 = await prisma.story.create({
    data: {
      id: "seed-bajka-002",
      userId: user.id,
      childProfileId: marek.id,
      title: "Marek i Smokowy Skarb",
      theme: StoryTheme.ADVENTURE,
      status: StoryStatus.PUBLISHED,
      summary: BAJKA_2_OPIS,
      content: BAJKA_2_TRESC,
      moral: "Prawdziwy skarb to odwaga i czas spędzony z bliskimi.",
      extra: JSON.stringify({ ton: "PRZYGODOWA", dlugosc: "LONG", tematWyswietlany: "Przygoda", dodatkowe: "smok i skarb" }),
    },
  });

  await prisma.storyVersion.create({
    data: {
      storyId: bajka2.id,
      version: 1,
      content: BAJKA_2_TRESC,
      modelId: "local-generator-v1",
    },
  });

  // Bajka 3 — Zosia, SPACE, DRAFT
  const bajka3 = await prisma.story.create({
    data: {
      id: "seed-bajka-003",
      userId: user.id,
      childProfileId: zosia.id,
      title: "Zosia i Zagubiona Gwiazdka",
      theme: StoryTheme.SPACE,
      status: StoryStatus.DRAFT,
      summary: BAJKA_3_OPIS,
      content: BAJKA_3_TRESC,
      moral: "Przyjaźń jest ważna nawet między gwiazdami.",
      extra: JSON.stringify({ ton: "SPOKOJNA", dlugosc: "SHORT", tematWyswietlany: "Kosmos", dodatkowe: null }),
    },
  });

  await prisma.storyVersion.create({
    data: {
      storyId: bajka3.id,
      version: 1,
      content: BAJKA_3_TRESC,
      modelId: "local-generator-v1",
    },
  });

  // ── 5. Tagi bajek ─────────────────────────────────────────────────────────
  await prisma.storyTag.createMany({
    data: [
      { storyId: bajka1.id, tag: "magia" },
      { storyId: bajka1.id, tag: "wróżki" },
      { storyId: bajka1.id, tag: "las" },
      { storyId: bajka2.id, tag: "przygoda" },
      { storyId: bajka2.id, tag: "skarb" },
      { storyId: bajka2.id, tag: "smok" },
      { storyId: bajka3.id, tag: "kosmos" },
      { storyId: bajka3.id, tag: "gwiazdy" },
    ],
  });

  // ── 6. Audit log ──────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    skipDuplicates: true,
    data: [
      { userId: user.id, action: "user.register", resource: "User", resourceId: user.id },
      { userId: user.id, action: "story.create",  resource: "Story", resourceId: bajka1.id, metadata: { theme: "MAGIC" } },
      { userId: user.id, action: "story.create",  resource: "Story", resourceId: bajka2.id, metadata: { theme: "ADVENTURE" } },
      { userId: user.id, action: "story.create",  resource: "Story", resourceId: bajka3.id, metadata: { theme: "SPACE", status: "DRAFT" } },
    ],
  });

  // ── 7. Użytkownik ADMIN ───────────────────────────────────────────────────
  console.log("🛡️  Tworzenie konta administratora…");
  const adminHash = await bcrypt.hash("Admin1234!", 12);
  await prisma.user.create({
    data: {
      id: "seed-admin-001",
      email: "admin@bajkowyswiat.pl",
      name: "Administrator",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  await prisma.subscription.create({
    data: { userId: "seed-admin-001", plan: SubscriptionPlan.PREMIUM },
  });

  // ── Przykładowe zgłoszenie ─────────────────────────────────────────────────
  await prisma.report.create({
    data: {
      userId: user.id,
      type: "BUG",
      subject: "Bajka nie generuje się po wyborze tematu Kosmos",
      description: "Po wybraniu tematu Kosmos i kliknięciu 'Stwórz bajkę' pojawia się błąd. Próbowałam kilka razy — nie działa od wczoraj.",
      status: "OPEN",
    },
  });

  // ── Podsumowanie ──────────────────────────────────────────────────────────
  console.log("\n✅ Seed zakończony pomyślnie!\n");
  console.log("─────────────────────────────────────────");
  console.log(`👤 Użytkownik:  ${user.email}`);
  console.log(`   Hasło:       ${TEST_PASSWORD}`);
  console.log(`   Subskrypcja: FREE`);
  console.log(`\n👧 Profil 1:   ${zosia.name} (${zosia.age} lat, dziewczynka)`);
  console.log(`👦 Profil 2:   ${marek.name} (${marek.age} lat, chłopiec)`);
  console.log(`\n📖 Bajka 1:   "${bajka1.title}" [PUBLISHED, MAGIC]`);
  console.log(`📖 Bajka 2:   "${bajka2.title}" [PUBLISHED, ADVENTURE]`);
  console.log(`📖 Bajka 3:   "${bajka3.title}" [DRAFT, SPACE]`);
  console.log(`\n🛡️  Admin:       admin@bajkowyswiat.pl`);
  console.log(`   Hasło:       Admin1234!`);
  console.log(`   Panel:       /admin`);
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Błąd seeda:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
