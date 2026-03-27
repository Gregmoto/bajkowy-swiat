import { PrismaClient, Gender, StoryTheme, StoryStatus, SubscriptionPlan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Uruchamianie seeda...");

  // --- User testowy ---
  const user = await prisma.user.upsert({
    where: { email: "dev@bajkowyswiat.pl" },
    update: {},
    create: {
      id: "seed-user-001",
      email: "dev@bajkowyswiat.pl",
      name: "Rodzic Testowy",
      role: "USER",
    },
  });

  // --- Subskrypcja (FREE) ---
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: SubscriptionPlan.FREE,
    },
  });

  // --- Profil dziecka ---
  const profil = await prisma.childProfile.upsert({
    where: { id: "seed-profil-001" },
    update: {},
    create: {
      id: "seed-profil-001",
      userId: user.id,
      name: "Zosia",
      age: 5,
      gender: Gender.GIRL,
      avatar: "🧚",
    },
  });

  // --- Bajka z wersją ---
  const bajka = await prisma.story.upsert({
    where: { id: "seed-bajka-001" },
    update: {},
    create: {
      id: "seed-bajka-001",
      userId: user.id,
      childProfileId: profil.id,
      theme: StoryTheme.MAGIC,
      moral: "Odwaga i dobroć otwierają każde drzwi.",
      title: "Zosia i Zaczarowany Las",
      status: StoryStatus.PUBLISHED,
    },
  });

  await prisma.storyVersion.upsert({
    where: { storyId_version: { storyId: bajka.id, version: 1 } },
    update: {},
    create: {
      storyId: bajka.id,
      version: 1,
      content:
        "Dawno, dawno temu w małym domku na skraju lasu mieszkała dziewczynka o imieniu Zosia...\n\n" +
        "Pewnego słonecznego poranka Zosia wybrała się na spacer i znalazła magiczny różowy kwiatek...\n\n" +
        "I żyli długo i szczęśliwie.",
      modelId: "claude-opus-4-6",
    },
  });

  // --- AuditLog ---
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "story.create",
      resource: "Story",
      resourceId: bajka.id,
      metadata: { theme: "MAGIC", version: 1 },
    },
  });

  console.log("✅ Seed zakończony!");
  console.log(`   User:  ${user.email}`);
  console.log(`   Profil: ${profil.name} (${profil.age} lat)`);
  console.log(`   Bajka:  "${bajka.title}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
