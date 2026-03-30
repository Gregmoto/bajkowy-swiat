import {
  PrismaClient,
  Gender,
  StoryTheme,
  StoryStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingPeriod,
  PaymentStatus,
  PaymentMethod,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  ActivityLogType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 20) + 2, Math.floor(Math.random() * 59), 0, 0);
  return d;
}
function dateAt(year: number, month: number, day: number, hour = 10): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

// ---------------------------------------------------------------------------
// SEED IDs (stałe — pozwalają na upsert przy wielokrotnym uruchomieniu)
// ---------------------------------------------------------------------------
const IDS = {
  admin:   "seed-admin-001",
  user1:   "seed-user-001",  // Anna Kowalska — FREE
  user2:   "seed-user-002",  // Piotr Nowak — STARTER MONTHLY
  user3:   "seed-user-003",  // Maria Wiśniewska — PREMIUM MONTHLY
  user4:   "seed-user-004",  // Tomasz Kowalczyk — STARTER YEARLY
  user5:   "seed-user-005",  // Karolina Zielińska — PREMIUM YEARLY
  user6:   "seed-user-006",  // Michał Dąbrowski — STARTER MONTHLY (anulowany)
  user7:   "seed-user-007",  // Agnieszka Lewandowska — FREE (stary user)
  user8:   "seed-user-008",  // Robert Wójcik — PREMIUM MONTHLY

  profil1: "seed-profil-zosia",
  profil2: "seed-profil-marek",
  profil3: "seed-profil-ala",
  profil4: "seed-profil-kacper",
  profil5: "seed-profil-natalia",

  bajka1:  "seed-bajka-001",
  bajka2:  "seed-bajka-002",
  bajka3:  "seed-bajka-003",
  bajka4:  "seed-bajka-004",
  bajka5:  "seed-bajka-005",
  bajka6:  "seed-bajka-006",
};

// ---------------------------------------------------------------------------
// Treści bajek
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

— Twoje życzenie spełnione — powiedziała najstarsza wróżka. — A w nagrodę za bezinteresowność otrzymasz ten magiczny kamyczek.

Zosia wróciła do domu z różowym kamyczkiem w dłoni i ogromnym uśmiechem na twarzy.`;

const BAJKA_2_TRESC = `Marek miał osiem lat i całe życie marzył o przygodzie. Pewnego dnia w starym pudełku po butach znalazł wyblakłą mapę z narysowanym smokiem i napisem: „Tu leży skarb".

— Tato! — krzyknął Marek. — To musi być prawdziwa mapa skarbów!

Ojciec spojrzał poważnie i powiedział: — Jeśli chcesz, możemy poszukać razem. Ale pamiętaj, prawdziwe przygody wymagają odwagi.

Na szczycie górki znaleźli kamienną skrzynkę. Marek otworzył ją drżącymi rękami. W środku leżało pięć złotych monet i karteczka:

„Skarb to nie złoto. Skarb to odwaga, by szukać, i ktoś bliski, z kim możesz dzielić przygodę."

Marek spojrzał na ojca i uśmiechnął się szeroko.`;

const BAJKA_3_TRESC = `Zosia zawsze patrzyła w niebo i liczyła gwiazdy przed snem. Pewnej nocy przez okno jej pokoju wleciała mała, mrugająca iskierka.

— Pomocy — powiedziała iskierka płaczliwym głosem. — Jestem Gwiazdką Polaris i zgubiłam się wracając do domu.

Zosia usiadła na łóżku z szeroko otwartymi oczami. — Nie bój się. Pomogę ci!

— Tam jest Wielka Niedźwiedzica — powiedziała Zosia, wskazując palcem. — Jej ogon wskazuje zawsze na północ. Twój dom jest właśnie tam!

Gwiazdka zaświeciła z radości i pomknęła ku niebu. Zosia pomachała jej na pożegnanie.`;

const BAJKA_4_TRESC = `Ala miała sześć lat i najlepszą przyjaciółkę na świecie — pluszowego królika Boba. Pewnego dnia Bob zaginął.

Ala szukała wszędzie: pod łóżkiem, w szafie, za kanapą. Nic.

— Nie martw się — powiedziała mama. — Razem go znajdziemy.

Razem przeszukali cały dom. I wreszcie — w pralce, przykryty starym swetrem, leżał Bob z jednym uchem wystającym na wierzch.

— Bob! — krzyknęła Ala i przytuliła go mocno. — Już zawsze będę uważać, gdzie cię kładę.

I dotrzymała słowa.`;

const BAJKA_5_TRESC = `Kacper był najmłodszym astronautą na pokładzie rakiety Bravura VII. Miał dziewięć lat i plecak pełen kanapek.

Gdy dotarli na Księżyc, Kacper jako pierwszy wyskoczył na srebrny pył.

— Jeden mały krok dla Kacpra — powiedział poważnie — wielki krok dla kanapek z szynką.

Kosmici, którzy obserwowali lądowanie z ukrytej bazy, wybuchnęli śmiechem. Okazało się, że oni też lubili kanapki.

Kacper wrócił do domu z kosmicznym przyjacielem i przepisem na galaktyczną zupę.`;

const BAJKA_6_TRESC = `W małej wiosce żył smok Ignaś, który bał się ognia. Wszyscy śmiali się z niego, bo co to za smok, który nie zieje ogniem?

— Ja nie chcę palić — mówił Ignaś spokojnie. — Wolę piec chleb.

I rzeczywiście — Ignaś nauczył się regulować temperaturę oddechu tak dokładnie, że jego chleb był najlepszy w całym królestwie.

Pewnego zimowego wieczoru, gdy wielka burza zawiała wszystkie świece w zamku, tylko Ignaś mógł zapalić kominek.

Król ukłonił się nisko. — Dziękuję, Ignasiu. Masz rację — każdy talent jest cenny po swojemu.`;

// ---------------------------------------------------------------------------
// Główna funkcja
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱 Uruchamianie kompleksowego seeda bazy danych…\n");

  // ── 0. Czyszczenie ────────────────────────────────────────────────────────
  console.log("🧹 Czyszczenie starych danych seed…");
  const allUserIds = Object.values(IDS).filter((id) => id.startsWith("seed-user") || id.startsWith("seed-admin"));

  // Usuń w odpowiedniej kolejności (ze względu na FK)
  await prisma.ticketMessage.deleteMany({ where: { ticket: { userId: { in: allUserIds } } } });
  await prisma.supportTicket.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.auditLog.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.userActivityLog.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.adminNote.deleteMany({ where: { OR: [{ userId: { in: allUserIds } }, { authorId: { in: allUserIds } }] } });
  await prisma.refundRequest.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.invoice.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.payment.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.subscription.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.storyTag.deleteMany({ where: { story: { userId: { in: allUserIds } } } });
  await prisma.storyVersion.deleteMany({ where: { story: { userId: { in: allUserIds } } } });
  await prisma.storyLike.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.story.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.childProfile.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.report.deleteMany({ where: { userId: { in: allUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: allUserIds } } });

  // ── 1. Hasła ──────────────────────────────────────────────────────────────
  console.log("🔑 Hashowanie haseł…");
  const adminHash = await bcrypt.hash("Admin1234!", 12);
  const userHash  = await bcrypt.hash("Test1234!", 12);

  // ── 2. Użytkownicy ────────────────────────────────────────────────────────
  console.log("👤 Tworzenie użytkowników…");

  await prisma.user.createMany({
    data: [
      {
        id: IDS.admin, email: "admin@bajkowyswiat.pl", name: "Administrator",
        passwordHash: adminHash, role: "ADMIN",
        createdAt: dateAt(2025, 8, 1),
      },
      {
        id: IDS.user1, email: "test@bajkowyswiat.pl", name: "Anna Kowalska",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 10, 5),
        lastActiveAt: daysAgo(1),
      },
      {
        id: IDS.user2, email: "piotr.nowak@example.com", name: "Piotr Nowak",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 10, 12),
        lastActiveAt: daysAgo(3),
      },
      {
        id: IDS.user3, email: "maria.wisniewska@example.com", name: "Maria Wiśniewska",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 11, 3),
        lastActiveAt: daysAgo(0),
      },
      {
        id: IDS.user4, email: "tomasz.kowalczyk@example.com", name: "Tomasz Kowalczyk",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 11, 20),
        lastActiveAt: daysAgo(7),
      },
      {
        id: IDS.user5, email: "karolina.zielinska@example.com", name: "Karolina Zielińska",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 12, 8),
        lastActiveAt: daysAgo(2),
      },
      {
        id: IDS.user6, email: "michal.dabrowski@example.com", name: "Michał Dąbrowski",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 12, 15),
        lastActiveAt: daysAgo(45),
      },
      {
        id: IDS.user7, email: "agnieszka.lewandowska@example.com", name: "Agnieszka Lewandowska",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2025, 9, 20),
        lastActiveAt: daysAgo(60),
      },
      {
        id: IDS.user8, email: "robert.wojcik@example.com", name: "Robert Wójcik",
        passwordHash: userHash, role: "USER",
        createdAt: dateAt(2026, 1, 10),
        lastActiveAt: daysAgo(1),
      },
    ],
  });

  // ── 3. Subskrypcje ────────────────────────────────────────────────────────
  console.log("💳 Tworzenie subskrypcji…");

  await prisma.subscription.createMany({
    data: [
      // Admin — PREMIUM
      {
        userId: IDS.admin, plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.MONTHLY,
        currentPeriodStart: dateAt(2026, 3, 1),
        currentPeriodEnd:   dateAt(2026, 4, 1),
        createdAt: dateAt(2025, 8, 1),
      },
      // Anna Kowalska — FREE
      {
        userId: IDS.user1, plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.MONTHLY,
        storiesThisMonth: 3,
        createdAt: dateAt(2025, 10, 5),
      },
      // Piotr Nowak — STARTER MONTHLY
      {
        userId: IDS.user2, plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.MONTHLY,
        currentPeriodStart: dateAt(2026, 3, 12),
        currentPeriodEnd:   dateAt(2026, 4, 12),
        createdAt: dateAt(2025, 10, 12),
      },
      // Maria Wiśniewska — PREMIUM MONTHLY
      {
        userId: IDS.user3, plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.MONTHLY,
        currentPeriodStart: dateAt(2026, 3, 3),
        currentPeriodEnd:   dateAt(2026, 4, 3),
        createdAt: dateAt(2025, 11, 3),
      },
      // Tomasz Kowalczyk — STARTER YEARLY
      {
        userId: IDS.user4, plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.YEARLY,
        currentPeriodStart: dateAt(2025, 11, 20),
        currentPeriodEnd:   dateAt(2026, 11, 20),
        createdAt: dateAt(2025, 11, 20),
      },
      // Karolina Zielińska — PREMIUM YEARLY
      {
        userId: IDS.user5, plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.YEARLY,
        currentPeriodStart: dateAt(2025, 12, 8),
        currentPeriodEnd:   dateAt(2026, 12, 8),
        createdAt: dateAt(2025, 12, 8),
      },
      // Michał Dąbrowski — STARTER MONTHLY (anulowany)
      {
        userId: IDS.user6, plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.CANCELED, billingPeriod: BillingPeriod.MONTHLY,
        canceledAt: dateAt(2026, 2, 15),
        cancelAtPeriodEnd: false,
        createdAt: dateAt(2025, 12, 15),
      },
      // Agnieszka Lewandowska — FREE
      {
        userId: IDS.user7, plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.MONTHLY,
        createdAt: dateAt(2025, 9, 20),
      },
      // Robert Wójcik — PREMIUM MONTHLY
      {
        userId: IDS.user8, plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE, billingPeriod: BillingPeriod.MONTHLY,
        currentPeriodStart: dateAt(2026, 3, 10),
        currentPeriodEnd:   dateAt(2026, 4, 10),
        createdAt: dateAt(2026, 1, 10),
      },
    ],
  });

  // ── 4. Płatności (Oct 2025 – Mar 2026) ────────────────────────────────────
  console.log("💰 Tworzenie płatności (6 miesięcy)…");

  const payments = [
    // ── Październik 2025
    { id: "seed-pay-oct-01", userId: IDS.user2, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Piotr",    createdAt: dateAt(2025, 10, 12) },
    { id: "seed-pay-oct-02", userId: IDS.user7, amount: 1900, currency: "PLN", status: PaymentStatus.FAILED,    paymentMethod: PaymentMethod.BLIK,     description: "Starter Monthly — Agnieszka (nieudana)", createdAt: dateAt(2025, 10, 22) },
    // ── Listopad 2025
    { id: "seed-pay-nov-01", userId: IDS.user2, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Piotr",    createdAt: dateAt(2025, 11, 3) },
    { id: "seed-pay-nov-02", userId: IDS.user3, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Premium Monthly — Maria",    createdAt: dateAt(2025, 11, 3) },
    { id: "seed-pay-nov-03", userId: IDS.user4, amount: 19000, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.TRANSFER, description: "Starter Yearly — Tomasz",   createdAt: dateAt(2025, 11, 20) },
    // ── Grudzień 2025
    { id: "seed-pay-dec-01", userId: IDS.user2, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Piotr",    createdAt: dateAt(2025, 12, 3) },
    { id: "seed-pay-dec-02", userId: IDS.user3, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.BLIK,     description: "Premium Monthly — Maria",    createdAt: dateAt(2025, 12, 3) },
    { id: "seed-pay-dec-03", userId: IDS.user5, amount: 58800, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,    description: "Premium Yearly — Karolina",  createdAt: dateAt(2025, 12, 8) },
    { id: "seed-pay-dec-04", userId: IDS.user6, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Michał",   createdAt: dateAt(2025, 12, 15) },
    { id: "seed-pay-dec-05", userId: IDS.user6, amount: 1900, currency: "PLN", status: PaymentStatus.FAILED,    paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Michał (nieudana)", createdAt: dateAt(2025, 12, 28) },
    // ── Styczeń 2026
    { id: "seed-pay-jan-01", userId: IDS.user2, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Piotr",    createdAt: dateAt(2026, 1, 3) },
    { id: "seed-pay-jan-02", userId: IDS.user3, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Premium Monthly — Maria",    createdAt: dateAt(2026, 1, 3) },
    { id: "seed-pay-jan-03", userId: IDS.user6, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.BLIK,     description: "Starter Monthly — Michał",   createdAt: dateAt(2026, 1, 15) },
    { id: "seed-pay-jan-04", userId: IDS.user8, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.GOOGLE_PAY, description: "Premium Monthly — Robert",  createdAt: dateAt(2026, 1, 10) },
    { id: "seed-pay-jan-05", userId: IDS.user1, amount: 1900, currency: "PLN", status: PaymentStatus.FAILED,    paymentMethod: PaymentMethod.BLIK,     description: "Starter Monthly — Anna (nieudana)", createdAt: dateAt(2026, 1, 20) },
    // ── Luty 2026
    { id: "seed-pay-feb-01", userId: IDS.user2, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Piotr",    createdAt: dateAt(2026, 2, 3) },
    { id: "seed-pay-feb-02", userId: IDS.user3, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Premium Monthly — Maria",    createdAt: dateAt(2026, 2, 3) },
    { id: "seed-pay-feb-03", userId: IDS.user8, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.GOOGLE_PAY, description: "Premium Monthly — Robert",  createdAt: dateAt(2026, 2, 10) },
    { id: "seed-pay-feb-04", userId: IDS.user3, amount: 4900, currency: "PLN", status: PaymentStatus.REFUNDED,  paymentMethod: PaymentMethod.CARD,     description: "Premium Monthly — Maria (zwrot)", createdAt: dateAt(2026, 2, 25) },
    // ── Marzec 2026
    { id: "seed-pay-mar-01", userId: IDS.user2, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.CARD,     description: "Starter Monthly — Piotr",    createdAt: dateAt(2026, 3, 3) },
    { id: "seed-pay-mar-02", userId: IDS.user3, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.BLIK,     description: "Premium Monthly — Maria",    createdAt: dateAt(2026, 3, 3) },
    { id: "seed-pay-mar-03", userId: IDS.user8, amount: 4900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.APPLE_PAY, description: "Premium Monthly — Robert",  createdAt: dateAt(2026, 3, 10) },
    { id: "seed-pay-mar-04", userId: IDS.user1, amount: 1900, currency: "PLN", status: PaymentStatus.SUCCEEDED, paymentMethod: PaymentMethod.BLIK,     description: "Starter Monthly — Anna",     createdAt: dateAt(2026, 3, 18) },
    { id: "seed-pay-mar-05", userId: IDS.user5, amount: 0,    currency: "PLN", status: PaymentStatus.FAILED,    paymentMethod: PaymentMethod.CARD,     description: "Premium Yearly renewal — nieudana", createdAt: dateAt(2026, 3, 20) },
  ];

  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // ── 5. Faktury ────────────────────────────────────────────────────────────
  console.log("🧾 Tworzenie faktur…");

  await prisma.invoice.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-inv-001",
        userId: IDS.user3, paymentId: "seed-pay-nov-02",
        number: "FS/2025/001", amount: 4900, currency: "PLN",
        status: "PAID", taxRate: 23, taxAmount: 916, netAmount: 3984,
        buyerName: "Maria Wiśniewska",
        issuedAt: dateAt(2025, 11, 3), paidAt: dateAt(2025, 11, 3),
      },
      {
        id: "seed-inv-002",
        userId: IDS.user4, paymentId: "seed-pay-nov-03",
        number: "FS/2025/002", amount: 19000, currency: "PLN",
        status: "PAID", taxRate: 23, taxAmount: 3553, netAmount: 15447,
        buyerName: "Tomasz Kowalczyk",
        issuedAt: dateAt(2025, 11, 20), paidAt: dateAt(2025, 11, 20),
      },
      {
        id: "seed-inv-003",
        userId: IDS.user5, paymentId: "seed-pay-dec-03",
        number: "FS/2025/003", amount: 58800, currency: "PLN",
        status: "PAID", taxRate: 23, taxAmount: 10992, netAmount: 47808,
        buyerName: "Karolina Zielińska",
        issuedAt: dateAt(2025, 12, 8), paidAt: dateAt(2025, 12, 8),
      },
    ],
  });

  // ── 6. Profile dzieci ──────────────────────────────────────────────────────
  console.log("👧👦 Tworzenie profili dzieci…");

  const zosia = await prisma.childProfile.upsert({
    where: { id: IDS.profil1 },
    update: {},
    create: {
      id: IDS.profil1, userId: IDS.user1,
      name: "Zosia", age: 5, gender: Gender.GIRL, avatar: "🧚",
      interests: ["Przyroda", "Zwierzęta", "Bajki", "Taniec"],
      favoriteColor: "różowy", favoriteAnimal: "jednorożec",
      notes: "Uwielbia wróżki i magiczne opowieści. Boi się burzy.",
    },
  });

  const marek = await prisma.childProfile.upsert({
    where: { id: IDS.profil2 },
    update: {},
    create: {
      id: IDS.profil2, userId: IDS.user1,
      name: "Marek", age: 8, gender: Gender.BOY, avatar: "🦁",
      interests: ["Sport", "Kosmos", "Dinozaury", "Roboty"],
      favoriteColor: "niebieski", favoriteAnimal: "smok",
      notes: "Uwielbia przygody i zagadki. Chce zostać astronautą.",
    },
  });

  const ala = await prisma.childProfile.upsert({
    where: { id: IDS.profil3 },
    update: {},
    create: {
      id: IDS.profil3, userId: IDS.user3,
      name: "Ala", age: 6, gender: Gender.GIRL, avatar: "🌸",
      interests: ["Muzyka", "Rysowanie", "Zwierzęta"],
      favoriteColor: "fioletowy", favoriteAnimal: "królik",
    },
  });

  const kacper = await prisma.childProfile.upsert({
    where: { id: IDS.profil4 },
    update: {},
    create: {
      id: IDS.profil4, userId: IDS.user2,
      name: "Kacper", age: 9, gender: Gender.BOY, avatar: "🚀",
      interests: ["Kosmos", "Matematyka", "Lego"],
      favoriteColor: "czarny", favoriteAnimal: "orzeł",
    },
  });

  const natalia = await prisma.childProfile.upsert({
    where: { id: IDS.profil5 },
    update: {},
    create: {
      id: IDS.profil5, userId: IDS.user8,
      name: "Natalia", age: 7, gender: Gender.GIRL, avatar: "🦋",
      interests: ["Bajki", "Taniec", "Kwiaty"],
      favoriteColor: "żółty", favoriteAnimal: "motyl",
    },
  });

  // ── 7. Bajki ───────────────────────────────────────────────────────────────
  console.log("📖 Tworzenie bajek…");

  const bajka1 = await prisma.story.upsert({
    where: { id: IDS.bajka1 },
    update: {},
    create: {
      id: IDS.bajka1, userId: IDS.user1, childProfileId: zosia.id,
      title: "Zosia i Zaczarowany Las", theme: StoryTheme.MAGIC, status: StoryStatus.PUBLISHED,
      summary: "Zosia odkrywa zaczarowany las, gdzie drzewa mówią, a kwiatki śpiewają.",
      content: BAJKA_1_TRESC, moral: "Dobroć i odwaga otwierają drzwi do cudów.",
      extra: JSON.stringify({ ton: "MAGICZNA", dlugosc: "MEDIUM" }),
      createdAt: dateAt(2025, 10, 10),
    },
  });

  const bajka2 = await prisma.story.upsert({
    where: { id: IDS.bajka2 },
    update: {},
    create: {
      id: IDS.bajka2, userId: IDS.user1, childProfileId: marek.id,
      title: "Marek i Smokowy Skarb", theme: StoryTheme.ADVENTURE, status: StoryStatus.PUBLISHED,
      summary: "Marek odnajduje tajemniczą mapę i wyrusza z tatą na poszukiwanie smoczego skarbu.",
      content: BAJKA_2_TRESC, moral: "Prawdziwy skarb to odwaga i czas spędzony z bliskimi.",
      extra: JSON.stringify({ ton: "PRZYGODOWA", dlugosc: "LONG" }),
      createdAt: dateAt(2025, 10, 18),
    },
  });

  const bajka3 = await prisma.story.upsert({
    where: { id: IDS.bajka3 },
    update: {},
    create: {
      id: IDS.bajka3, userId: IDS.user1, childProfileId: zosia.id,
      title: "Zosia i Zagubiona Gwiazdka", theme: StoryTheme.SPACE, status: StoryStatus.DRAFT,
      summary: "Zosia pomaga zagubionej gwiazdce odnaleźć drogę do domu.",
      content: BAJKA_3_TRESC, moral: "Przyjaźń jest ważna nawet między gwiazdami.",
      extra: JSON.stringify({ ton: "SPOKOJNA", dlugosc: "SHORT" }),
      createdAt: dateAt(2025, 11, 5),
    },
  });

  const bajka4 = await prisma.story.upsert({
    where: { id: IDS.bajka4 },
    update: {},
    create: {
      id: IDS.bajka4, userId: IDS.user3, childProfileId: ala.id,
      title: "Ala i Zaginiony Królik Bob", theme: StoryTheme.FRIENDSHIP, status: StoryStatus.PUBLISHED,
      summary: "Ala szuka swojego ulubionego pluszaka Boba i uczy się dbać o to, co kocha.",
      content: BAJKA_4_TRESC, moral: "Dbaj o to, co kochasz.",
      extra: JSON.stringify({ ton: "CIEPŁA", dlugosc: "SHORT" }),
      createdAt: dateAt(2025, 12, 10),
    },
  });

  const bajka5 = await prisma.story.upsert({
    where: { id: IDS.bajka5 },
    update: {},
    create: {
      id: IDS.bajka5, userId: IDS.user2, childProfileId: kacper.id,
      title: "Kacper — Najmłodszy Astronauta", theme: StoryTheme.SPACE, status: StoryStatus.PUBLISHED,
      summary: "Kacper jako pierwszy dziewięciolatek ląduje na Księżycu i zaprzyjaźnia się z kosmitami.",
      content: BAJKA_5_TRESC, moral: "Odwaga i humor otwierają nawet kosmiczne drzwi.",
      extra: JSON.stringify({ ton: "HUMORYSTYCZNA", dlugosc: "MEDIUM" }),
      createdAt: dateAt(2026, 1, 15),
    },
  });

  const bajka6 = await prisma.story.upsert({
    where: { id: IDS.bajka6 },
    update: {},
    create: {
      id: IDS.bajka6, userId: IDS.user8, childProfileId: natalia.id,
      title: "Ignaś — Smok, Który Piekł Chleb", theme: StoryTheme.MAGIC, status: StoryStatus.PUBLISHED,
      summary: "Smok Ignaś bał się ognia, ale odkrył, że jego wyjątkowy talent jest bezcenny.",
      content: BAJKA_6_TRESC, moral: "Każdy talent jest cenny po swojemu.",
      extra: JSON.stringify({ ton: "REFLEKSYJNA", dlugosc: "MEDIUM" }),
      createdAt: dateAt(2026, 2, 8),
    },
  });

  // Wersje bajek
  await prisma.storyVersion.createMany({
    skipDuplicates: true,
    data: [
      { storyId: bajka1.id, version: 1, content: BAJKA_1_TRESC, modelId: "gpt-4o-2024-08" },
      { storyId: bajka2.id, version: 1, content: BAJKA_2_TRESC, modelId: "gpt-4o-2024-08" },
      { storyId: bajka3.id, version: 1, content: BAJKA_3_TRESC, modelId: "gpt-4o-2024-08" },
      { storyId: bajka4.id, version: 1, content: BAJKA_4_TRESC, modelId: "gpt-4o-2024-11" },
      { storyId: bajka5.id, version: 1, content: BAJKA_5_TRESC, modelId: "gpt-4o-2024-11" },
      { storyId: bajka6.id, version: 1, content: BAJKA_6_TRESC, modelId: "gpt-4o-2024-11" },
    ],
  });

  // Tagi
  await prisma.storyTag.createMany({
    skipDuplicates: true,
    data: [
      { storyId: bajka1.id, tag: "magia"     }, { storyId: bajka1.id, tag: "wróżki"   }, { storyId: bajka1.id, tag: "las"       },
      { storyId: bajka2.id, tag: "przygoda"  }, { storyId: bajka2.id, tag: "skarb"    }, { storyId: bajka2.id, tag: "smok"      },
      { storyId: bajka3.id, tag: "kosmos"    }, { storyId: bajka3.id, tag: "gwiazdy"  },
      { storyId: bajka4.id, tag: "przyjaźń" }, { storyId: bajka4.id, tag: "pluszak"  },
      { storyId: bajka5.id, tag: "kosmos"    }, { storyId: bajka5.id, tag: "astronauta" }, { storyId: bajka5.id, tag: "humor"  },
      { storyId: bajka6.id, tag: "smok"      }, { storyId: bajka6.id, tag: "magia"    }, { storyId: bajka6.id, tag: "chleb"    },
    ],
  });

  // ── 8. Notatki admina ──────────────────────────────────────────────────────
  console.log("📝 Tworzenie notatek adminów…");

  await prisma.adminNote.createMany({
    data: [
      {
        userId: IDS.user6, authorId: IDS.admin,
        content: "Użytkownik anulował subskrypcję po 2 miesiącach. Warto podjąć próbę reaktywacji.",
        isPinned: true, isPrivate: true,
        createdAt: dateAt(2026, 2, 16),
      },
      {
        userId: IDS.user1, authorId: IDS.admin,
        content: "Użytkowniczka próbowała płacić BLIKiem — nieudana transakcja. Skontaktowała się przez formularz.",
        isPinned: false, isPrivate: true,
        createdAt: dateAt(2026, 1, 21),
      },
    ],
  });

  // ── 9. Logi aktywności użytkowników ───────────────────────────────────────
  console.log("📊 Tworzenie logów aktywności…");

  await prisma.userActivityLog.createMany({
    data: [
      // Anna
      { userId: IDS.user1, type: ActivityLogType.LOGIN,           createdAt: dateAt(2025, 10, 5),  ipAddress: "91.187.12.44" },
      { userId: IDS.user1, type: ActivityLogType.STORY_CREATE,    createdAt: dateAt(2025, 10, 10), metadata: { storyId: bajka1.id } },
      { userId: IDS.user1, type: ActivityLogType.STORY_CREATE,    createdAt: dateAt(2025, 10, 18), metadata: { storyId: bajka2.id } },
      { userId: IDS.user1, type: ActivityLogType.PAYMENT_FAIL,    createdAt: dateAt(2026, 1, 20),  metadata: { amount: 1900 } },
      { userId: IDS.user1, type: ActivityLogType.PAYMENT_SUCCESS, createdAt: dateAt(2026, 3, 18),  metadata: { amount: 1900 } },
      { userId: IDS.user1, type: ActivityLogType.SUBSCRIPTION_UPGRADE, createdAt: dateAt(2026, 3, 18), metadata: { plan: "STARTER" } },
      // Piotr
      { userId: IDS.user2, type: ActivityLogType.LOGIN,           createdAt: dateAt(2025, 10, 12), ipAddress: "83.21.55.102" },
      { userId: IDS.user2, type: ActivityLogType.SUBSCRIPTION_UPGRADE, createdAt: dateAt(2025, 10, 12), metadata: { plan: "STARTER" } },
      { userId: IDS.user2, type: ActivityLogType.STORY_CREATE,    createdAt: dateAt(2026, 1, 15),  metadata: { storyId: bajka5.id } },
      // Maria
      { userId: IDS.user3, type: ActivityLogType.LOGIN,           createdAt: dateAt(2025, 11, 3),  ipAddress: "176.9.45.201" },
      { userId: IDS.user3, type: ActivityLogType.SUBSCRIPTION_UPGRADE, createdAt: dateAt(2025, 11, 3), metadata: { plan: "PREMIUM" } },
      { userId: IDS.user3, type: ActivityLogType.STORY_CREATE,    createdAt: dateAt(2025, 12, 10), metadata: { storyId: bajka4.id } },
      // Michał
      { userId: IDS.user6, type: ActivityLogType.LOGIN,           createdAt: dateAt(2025, 12, 15), ipAddress: "89.64.11.77" },
      { userId: IDS.user6, type: ActivityLogType.SUBSCRIPTION_CANCEL, createdAt: dateAt(2026, 2, 15), metadata: { reason: "Za drogo" } },
      // Robert
      { userId: IDS.user8, type: ActivityLogType.LOGIN,           createdAt: dateAt(2026, 1, 10),  ipAddress: "195.44.33.12" },
      { userId: IDS.user8, type: ActivityLogType.SUBSCRIPTION_UPGRADE, createdAt: dateAt(2026, 1, 10), metadata: { plan: "PREMIUM" } },
      { userId: IDS.user8, type: ActivityLogType.STORY_CREATE,    createdAt: dateAt(2026, 2, 8),   metadata: { storyId: bajka6.id } },
    ],
  });

  // ── 10. Logi audytu ────────────────────────────────────────────────────────
  console.log("🔍 Tworzenie logów audytu…");

  await prisma.auditLog.createMany({
    data: [
      // Rejestracje
      { userId: IDS.user1, action: "user.register", resource: "User", resourceId: IDS.user1, createdAt: dateAt(2025, 10, 5) },
      { userId: IDS.user2, action: "user.register", resource: "User", resourceId: IDS.user2, createdAt: dateAt(2025, 10, 12) },
      { userId: IDS.user3, action: "user.register", resource: "User", resourceId: IDS.user3, createdAt: dateAt(2025, 11, 3) },
      { userId: IDS.user6, action: "user.register", resource: "User", resourceId: IDS.user6, createdAt: dateAt(2025, 12, 15) },
      { userId: IDS.user8, action: "user.register", resource: "User", resourceId: IDS.user8, createdAt: dateAt(2026, 1, 10) },
      // Admin akcje
      { userId: IDS.admin, action: "ticket.status_change", resource: "SupportTicket", metadata: { from: "OPEN", to: "IN_PROGRESS" }, createdAt: dateAt(2026, 1, 22), ipAddress: "10.0.0.1" },
      { userId: IDS.admin, action: "ticket.status_change", resource: "SupportTicket", metadata: { from: "IN_PROGRESS", to: "RESOLVED" }, createdAt: dateAt(2026, 2, 1), ipAddress: "10.0.0.1" },
      { userId: IDS.admin, action: "subscription.cancel",  resource: "Subscription",  metadata: { targetUserId: IDS.user6, plan: "STARTER" }, createdAt: dateAt(2026, 2, 15), ipAddress: "10.0.0.1" },
      { userId: IDS.admin, action: "user.note_update",     resource: "User", resourceId: IDS.user1, metadata: { action: "add" }, createdAt: dateAt(2026, 1, 21), ipAddress: "10.0.0.1" },
      // Bajki
      { userId: IDS.user1, action: "story.create", resource: "Story", resourceId: bajka1.id, metadata: { theme: "MAGIC" },     createdAt: dateAt(2025, 10, 10) },
      { userId: IDS.user1, action: "story.create", resource: "Story", resourceId: bajka2.id, metadata: { theme: "ADVENTURE" }, createdAt: dateAt(2025, 10, 18) },
      { userId: IDS.user3, action: "story.create", resource: "Story", resourceId: bajka4.id, metadata: { theme: "FRIENDSHIP" }, createdAt: dateAt(2025, 12, 10) },
      { userId: IDS.user2, action: "story.create", resource: "Story", resourceId: bajka5.id, metadata: { theme: "SPACE" },     createdAt: dateAt(2026, 1, 15) },
      { userId: IDS.user8, action: "story.create", resource: "Story", resourceId: bajka6.id, metadata: { theme: "MAGIC" },     createdAt: dateAt(2026, 2, 8) },
    ],
  });

  // ── 11. Zgłoszenia supportowe ─────────────────────────────────────────────
  console.log("🎫 Tworzenie zgłoszeń supportowych…");

  const ticket1 = await prisma.supportTicket.create({
    data: {
      id: "seed-ticket-001",
      userId: IDS.user1,
      subject: "Bajka nie generuje się po wyborze tematu Kosmos",
      description: "Po wybraniu tematu Kosmos i kliknięciu 'Stwórz bajkę' pojawia się błąd serwera. Próbowałam kilka razy — nie działa od wczoraj. Próbowałam też odświeżyć stronę i wyczyścić cache.",
      category: TicketCategory.TECHNICAL,
      priority: TicketPriority.HIGH,
      status: TicketStatus.RESOLVED,
      resolvedAt: dateAt(2026, 2, 1),
      createdAt: dateAt(2026, 1, 20),
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id, authorId: IDS.admin,
        content: "Dzień dobry! Sprawdzamy problem z tematem Kosmos. Wygląda na tymczasowy błąd po stronie serwera generowania. Czy problem nadal występuje?",
        isInternal: false, createdAt: dateAt(2026, 1, 22),
      },
      {
        ticketId: ticket1.id, authorId: IDS.user1,
        content: "Tak, problem nadal występuje. Mogę wybrać inne tematy bez problemu.",
        isInternal: false, createdAt: dateAt(2026, 1, 22, 15),
      },
      {
        ticketId: ticket1.id, authorId: IDS.admin,
        content: "Wewnętrzna notatka: zrestartować usługę generatora i sprawdzić logi. Błąd dotyczy prawdopodobnie limitu tokenów dla długich promptów kosmicznych.",
        isInternal: true, createdAt: dateAt(2026, 1, 23),
      },
      {
        ticketId: ticket1.id, authorId: IDS.admin,
        content: "Problem został naprawiony. Zwiększyliśmy limit tokenów dla tematu Kosmos. Proszę spróbować ponownie — wszystko powinno działać.",
        isInternal: false, createdAt: dateAt(2026, 2, 1),
      },
    ],
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      id: "seed-ticket-002",
      userId: IDS.user1,
      subject: "Nieudana płatność BLIK — pieniądze zeszły z konta",
      description: "Próbowałam opłacić subskrypcję Starter za pomocą BLIK. Pieniądze zostały pobrane z konta (1900 zł), ale subskrypcja nadal pokazuje plan FREE. Proszę o wyjaśnienie.",
      category: TicketCategory.BILLING,
      priority: TicketPriority.URGENT,
      status: TicketStatus.RESOLVED,
      resolvedAt: dateAt(2026, 1, 25),
      createdAt: dateAt(2026, 1, 21),
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket2.id, authorId: IDS.admin,
        content: "Przepraszamy za niedogodności! Sprawdzamy transakcję w systemie Stripe. Czy może Pani podać przybliżoną godzinę płatności?",
        isInternal: false, createdAt: dateAt(2026, 1, 21, 14),
      },
      {
        ticketId: ticket2.id, authorId: IDS.user1,
        content: "Płatność była ok. godz. 10:30 rano. Potwierdzenie z banku mam.",
        isInternal: false, createdAt: dateAt(2026, 1, 21, 16),
      },
      {
        ticketId: ticket2.id, authorId: IDS.admin,
        content: "Weryfikacja w Stripe: transakcja BLIK_20260121_1030 miała status 'processing' przez 2h — typowy problem z timeout BLIK. Zwrot powinien przyjść automatycznie w 3-5 dni roboczych.",
        isInternal: true, createdAt: dateAt(2026, 1, 22),
      },
      {
        ticketId: ticket2.id, authorId: IDS.admin,
        content: "Potwierdzono: środki zostały zwrócone na Pani konto. Subskrypcja została aktywowana ręcznie przez nasz zespół jako przeprosiny za utrudnienia. Miłego korzystania!",
        isInternal: false, createdAt: dateAt(2026, 1, 25),
      },
    ],
  });

  const ticket3 = await prisma.supportTicket.create({
    data: {
      id: "seed-ticket-003",
      userId: IDS.user3,
      subject: "Prośba o fakturę VAT za grudniową płatność",
      description: "Potrzebuję fakturę VAT za płatność z dnia 3 grudnia 2025 (Premium Monthly, 49 zł). Dane do faktury: Maria Wiśniewska, ul. Kwiatowa 12/5, 00-001 Warszawa, NIP: 7271234567.",
      category: TicketCategory.BILLING,
      priority: TicketPriority.NORMAL,
      status: TicketStatus.CLOSED,
      resolvedAt: dateAt(2025, 12, 10),
      closedAt: dateAt(2025, 12, 15),
      createdAt: dateAt(2025, 12, 7),
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket3.id, authorId: IDS.admin,
        content: "Faktura FS/2025/001 została wystawiona i wysłana na adres e-mail powiązany z kontem. W razie problemów prosimy o kontakt.",
        isInternal: false, createdAt: dateAt(2025, 12, 10),
      },
    ],
  });

  const ticket4 = await prisma.supportTicket.create({
    data: {
      id: "seed-ticket-004",
      userId: IDS.user2,
      subject: "Propozycja: bajki po angielsku",
      description: "Czy planujecie dodać możliwość generowania bajek w języku angielskim? Mam dziecko uczące się angielskiego i byłoby to super narzędzie do nauki języka przez bajki.",
      category: TicketCategory.FEATURE_REQUEST,
      priority: TicketPriority.LOW,
      status: TicketStatus.IN_PROGRESS,
      createdAt: dateAt(2026, 2, 10),
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket4.id, authorId: IDS.admin,
        content: "Dziękujemy za świetną propozycję! Wielojęzyczność jest na naszej roadmapie. Angielski będzie prawdopodobnie pierwszym dodatkowym językiem — planujemy wdrożenie w Q2 2026.",
        isInternal: false, createdAt: dateAt(2026, 2, 12),
      },
      {
        ticketId: ticket4.id, authorId: IDS.admin,
        content: "Dodano do backlogu produktowego jako priorytet. Zebrać podobne prośby i zagregować w raporcie dla Product Managera.",
        isInternal: true, createdAt: dateAt(2026, 2, 12, 15),
      },
    ],
  });

  await prisma.supportTicket.create({
    data: {
      id: "seed-ticket-005",
      userId: IDS.user8,
      subject: "Bajka wygenerowana z błędami gramatycznymi",
      description: "Bajka 'Ignaś — Smok, Który Piekł Chleb' zawiera kilka błędów gramatycznych i stylistycznych w środkowej części. Proszę o poprawienie lub możliwość regeneracji.",
      category: TicketCategory.CONTENT,
      priority: TicketPriority.NORMAL,
      status: TicketStatus.OPEN,
      createdAt: dateAt(2026, 3, 15),
    },
  });

  await prisma.supportTicket.create({
    data: {
      id: "seed-ticket-006",
      userId: IDS.user6,
      subject: "Jak anulować subskrypcję?",
      description: "Chciałbym anulować subskrypcję Starter. Nie mogę znaleźć takiej opcji w ustawieniach. Proszę o instrukcję lub anulowanie z Waszej strony.",
      category: TicketCategory.ACCOUNT,
      priority: TicketPriority.NORMAL,
      status: TicketStatus.CLOSED,
      resolvedAt: dateAt(2026, 2, 15),
      closedAt: dateAt(2026, 2, 15),
      createdAt: dateAt(2026, 2, 14),
    },
  });

  // ── 12. Ustawienia systemowe ────────────────────────────────────────────────
  console.log("⚙️  Inicjalizacja ustawień systemowych…");

  const defaultSettings: Array<{ key: string; value: unknown; label: string; group: string }> = [
    { key: "app.name",          value: "Bajkowy Świat",                  label: "Nazwa aplikacji",          group: "app"    },
    { key: "app.tagline",       value: "Magiczne bajki dla Twojego dziecka", label: "Slogan",               group: "app"    },
    { key: "app.contact_email", value: "kontakt@bajkowyswiat.pl",         label: "E-mail kontaktowy",        group: "app"    },
    { key: "app.support_email", value: "pomoc@bajkowyswiat.pl",           label: "E-mail supportu",          group: "app"    },
    { key: "app.from_name",     value: "Bajkowy Świat",                  label: "Nazwa nadawcy e-mail",      group: "app"    },
    { key: "seo.title",         value: "Bajkowy Świat — Personalizowane bajki AI", label: "Meta title",     group: "seo"    },
    { key: "seo.description",   value: "Twórz wyjątkowe, personalizowane bajki dla swoich dzieci za pomocą sztucznej inteligencji.", label: "Meta description", group: "seo" },
    { key: "seo.keywords",      value: "bajki dla dzieci, personalizowane bajki, AI, generator bajek", label: "Słowa kluczowe", group: "seo" },
    { key: "seo.og_image",      value: "/og-image.png",                  label: "Obraz OG",                 group: "seo"    },
    { key: "limits.free.stories_per_month",    value: 3,  label: "FREE — bajki/miesiąc",    group: "limits" },
    { key: "limits.starter.stories_per_month", value: 15, label: "STARTER — bajki/miesiąc", group: "limits" },
    { key: "limits.premium.stories_per_month", value: 50, label: "PREMIUM — bajki/miesiąc", group: "limits" },
    { key: "limits.max_child_profiles",        value: 5,  label: "Maks. profili dziecka",   group: "limits" },
    { key: "plans.starter.monthly_price",  value: 1900,  label: "STARTER — cena miesięczna (gr)", group: "plans" },
    { key: "plans.starter.yearly_price",   value: 19000, label: "STARTER — cena roczna (gr)",     group: "plans" },
    { key: "plans.premium.monthly_price",  value: 4900,  label: "PREMIUM — cena miesięczna (gr)", group: "plans" },
    { key: "plans.premium.yearly_price",   value: 49000, label: "PREMIUM — cena roczna (gr)",     group: "plans" },
    {
      key: "faq.items", label: "Lista FAQ", group: "faq",
      value: [
        { q: "Jak działa generator bajek?",    a: "Wpisz imię dziecka, wybierz temat i naciśnij przycisk. Nasza AI wygeneruje unikalną bajkę w kilka sekund." },
        { q: "Czy bajki są bezpieczne?",       a: "Tak. Każda bajka jest generowana z myślą o dzieciach — bez przemocy, strachu i nieodpowiednich treści." },
        { q: "Ile bajek mogę stworzyć?",       a: "W planie FREE masz 3 bajki miesięcznie. W planach płatnych limit jest wyższy." },
        { q: "Czy mogę anulować subskrypcję?", a: "Tak, w każdej chwili z poziomu ustawień konta. Dostęp zachowasz do końca opłaconego okresu." },
        { q: "Jak skontaktować się z pomocą?", a: "Wyślij wiadomość przez formularz kontaktowy lub napisz na pomoc@bajkowyswiat.pl." },
      ],
    },
    { key: "legal.terms_url",   value: "/regulamin",             label: "URL regulaminu",           group: "legal" },
    { key: "legal.privacy_url", value: "/polityka-prywatnosci",  label: "URL polityki prywatności", group: "legal" },
    { key: "legal.cookies_url", value: "/polityka-cookies",      label: "URL polityki cookies",     group: "legal" },
    { key: "legal.company",     value: "Bajkowy Świat Sp. z o.o.", label: "Nazwa firmy",            group: "legal" },
    { key: "legal.nip",         value: "",                        label: "NIP",                     group: "legal" },
    { key: "legal.address",     value: "ul. Bajkowa 1, 00-001 Warszawa", label: "Adres firmy",      group: "legal" },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value as never, label: s.label, group: s.group },
    });
  }

  // ── 13. Stare raporty (legacy) ─────────────────────────────────────────────
  await prisma.report.upsert({
    where: { id: "seed-report-001" },
    update: {},
    create: {
      id: "seed-report-001",
      userId: IDS.user7,
      type: "BUG",
      subject: "Strona logowania nie działa na Safari",
      description: "Na przeglądarce Safari (iOS 17) strona logowania wyświetla się niepoprawnie — przycisk 'Zaloguj się' jest poza ekranem.",
      status: "RESOLVED",
      resolvedAt: dateAt(2025, 10, 5),
      adminNote: "Naprawiono CSS dla Safari — dodano vendor prefix dla flex-gap.",
      createdAt: dateAt(2025, 9, 28),
    },
  });

  // ── Podsumowanie ───────────────────────────────────────────────────────────
  console.log("\n✅ Seed zakończony pomyślnie!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("🛡️  Admin:        admin@bajkowyswiat.pl  /  Admin1234!");
  console.log("👤 Użytkownik:   test@bajkowyswiat.pl   /  Test1234!");
  console.log("───────────────────────────────────────────────────────");
  console.log("Użytkownicy:");
  console.log("  Piotr Nowak         — Starter Monthly (aktywny)");
  console.log("  Maria Wiśniewska    — Premium Monthly (aktywna)");
  console.log("  Tomasz Kowalczyk    — Starter Yearly  (aktywny)");
  console.log("  Karolina Zielińska  — Premium Yearly  (aktywna)");
  console.log("  Michał Dąbrowski    — Starter Monthly (ANULOWANY)");
  console.log("  Agnieszka Lewandow. — FREE");
  console.log("  Robert Wójcik       — Premium Monthly (aktywny)");
  console.log("───────────────────────────────────────────────────────");
  console.log("Płatności: 24 transakcje (Oct 2025 – Mar 2026)");
  console.log("Bajki:     6 (4 PUBLISHED, 1 DRAFT)");
  console.log("Ustawienia: 25 wpisów (app, seo, limits, plans, faq, legal)");
  console.log("Tickety:   6 zgłoszeń supportowych z wiadomościami");
  console.log("Logi:      aktywność użytkowników + audyt adminów");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Błąd seeda:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
