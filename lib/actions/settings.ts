"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Brak uprawnień");
  return session;
}

// ---------------------------------------------------------------------------
// Pobierz wszystkie ustawienia (jako mapa key→value)
// ---------------------------------------------------------------------------
export async function getSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.systemSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getSettingsByGroup(group: string): Promise<Record<string, unknown>> {
  const rows = await prisma.systemSetting.findMany({ where: { group } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// ---------------------------------------------------------------------------
// Zapisz jedno ustawienie
// ---------------------------------------------------------------------------
export async function saveSetting(key: string, value: unknown): Promise<void> {
  const session = await verifyAdmin();
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value: value as never },
    create: { key, value: value as never },
  });
  await writeAuditLog({
    userId: session.userId,
    action: "settings.update",
    resource: "SystemSetting",
    resourceId: key,
    metadata: { key, value },
  });
  revalidatePath("/admin/ustawienia");
}

// ---------------------------------------------------------------------------
// Zapisz grupę ustawień (z formularza)
// ---------------------------------------------------------------------------
export async function saveSettingsGroup(
  group: string,
  data: Record<string, unknown>
): Promise<{ ok: true } | { error: string }> {
  try {
    const session = await verifyAdmin();
    for (const [key, value] of Object.entries(data)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: value as never, group },
        create: { key, value: value as never, group },
      });
    }
    await writeAuditLog({
      userId: session.userId,
      action: "settings.update",
      resource: "SystemSetting",
      metadata: { group, keys: Object.keys(data) },
    });
    revalidatePath("/admin/ustawienia");
    return { ok: true };
  } catch (e) {
    return { error: String(e) };
  }
}

// ---------------------------------------------------------------------------
// Inicjalizuj domyślne ustawienia (idempotent)
// ---------------------------------------------------------------------------
export async function initDefaultSettings(): Promise<void> {
  const defaults: Array<{ key: string; value: unknown; label: string; group: string }> = [
    // Aplikacja
    { key: "app.name",          value: "Bajkowy Świat",                  label: "Nazwa aplikacji",          group: "app"    },
    { key: "app.tagline",       value: "Magiczne bajki dla Twojego dziecka", label: "Slogan",               group: "app"    },
    { key: "app.contact_email", value: "kontakt@bajkowyswiat.pl",         label: "E-mail kontaktowy",        group: "app"    },
    { key: "app.support_email", value: "pomoc@bajkowyswiat.pl",           label: "E-mail supportu",          group: "app"    },
    { key: "app.from_name",     value: "Bajkowy Świat",                  label: "Nazwa nadawcy e-mail",      group: "app"    },
    // SEO
    { key: "seo.title",         value: "Bajkowy Świat — Personalizowane bajki AI", label: "Meta title",    group: "seo"    },
    { key: "seo.description",   value: "Twórz wyjątkowe, personalizowane bajki dla swoich dzieci za pomocą sztucznej inteligencji.", label: "Meta description", group: "seo" },
    { key: "seo.keywords",      value: "bajki dla dzieci, personalizowane bajki, AI, generator bajek",     label: "Słowa kluczowe (SEO)", group: "seo" },
    { key: "seo.og_image",      value: "/og-image.png",                  label: "Obraz OG (Social share)",  group: "seo"    },
    // Limity generowania
    { key: "limits.free.stories_per_month",    value: 3,  label: "FREE — bajki/miesiąc",    group: "limits" },
    { key: "limits.starter.stories_per_month", value: 15, label: "STARTER — bajki/miesiąc", group: "limits" },
    { key: "limits.premium.stories_per_month", value: 50, label: "PREMIUM — bajki/miesiąc", group: "limits" },
    { key: "limits.max_child_profiles",        value: 5,  label: "Maks. profili dziecka",   group: "limits" },
    // Plany cenowe (w groszach)
    { key: "plans.starter.monthly_price",  value: 1900,  label: "STARTER — cena miesięczna (gr)",   group: "plans" },
    { key: "plans.starter.yearly_price",   value: 19000, label: "STARTER — cena roczna (gr)",       group: "plans" },
    { key: "plans.premium.monthly_price",  value: 4900,  label: "PREMIUM — cena miesięczna (gr)",   group: "plans" },
    { key: "plans.premium.yearly_price",   value: 49000, label: "PREMIUM — cena roczna (gr)",       group: "plans" },
    { key: "plans.free.enabled",           value: true,  label: "Plan FREE aktywny",                group: "plans" },
    // FAQ
    {
      key: "faq.items",
      label: "Lista FAQ",
      group: "faq",
      value: [
        { q: "Jak działa generator bajek?",    a: "Wpisz imię dziecka, wybierz temat i naciśnij przycisk. Nasza AI wygeneruje unikalną bajkę w kilka sekund." },
        { q: "Czy bajki są bezpieczne?",       a: "Tak. Każda bajka jest generowana z myślą o dzieciach — bez przemocy, strachu i nieodpowiednich treści." },
        { q: "Ile bajek mogę stworzyć?",       a: "W planie FREE masz 3 bajki miesięcznie. W planach płatnych limit jest wyższy lub nieograniczony." },
        { q: "Czy mogę anulować subskrypcję?", a: "Tak, w każdej chwili z poziomu ustawień konta. Dostęp zachowasz do końca opłaconego okresu." },
        { q: "Jak skontaktować się z pomocą?", a: "Wyślij wiadomość przez formularz kontaktowy lub napisz na pomoc@bajkowyswiat.pl." },
      ],
    },
    // Prawne
    { key: "legal.terms_url",   value: "/regulamin",             label: "URL regulaminu",             group: "legal" },
    { key: "legal.privacy_url", value: "/polityka-prywatnosci",  label: "URL polityki prywatności",   group: "legal" },
    { key: "legal.cookies_url", value: "/polityka-cookies",      label: "URL polityki cookies",       group: "legal" },
    { key: "legal.company",     value: "Bajkowy Świat Sp. z o.o.", label: "Nazwa firmy",             group: "legal" },
    { key: "legal.nip",         value: "",                        label: "NIP",                       group: "legal" },
    { key: "legal.address",     value: "ul. Bajkowa 1, 00-001 Warszawa", label: "Adres firmy",       group: "legal" },
  ];

  for (const d of defaults) {
    await prisma.systemSetting.upsert({
      where: { key: d.key },
      update: {},  // nie nadpisuj istniejących
      create: { key: d.key, value: d.value as never, label: d.label, group: d.group },
    });
  }
}
