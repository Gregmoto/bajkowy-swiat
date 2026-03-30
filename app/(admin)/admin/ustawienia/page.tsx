export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import {
  Settings, Globe, DollarSign, Zap, HelpCircle, FileText, Building2,
} from "lucide-react";
import SettingsAppForm from "@/components/admin/settings/SettingsAppForm";
import SettingsSeoForm from "@/components/admin/settings/SettingsSeoForm";
import SettingsLimitsForm from "@/components/admin/settings/SettingsLimitsForm";
import SettingsPlansForm from "@/components/admin/settings/SettingsPlansForm";
import SettingsFaqForm from "@/components/admin/settings/SettingsFaqForm";
import SettingsLegalForm from "@/components/admin/settings/SettingsLegalForm";

type SectionId = "app" | "seo" | "limits" | "plans" | "faq" | "legal";

const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ElementType; description: string }> = [
  { id: "app",    label: "Ogólne",          icon: Settings,   description: "Nazwa aplikacji, kontakt, nadawca e-mail"        },
  { id: "seo",    label: "SEO",             icon: Globe,      description: "Meta title, description, słowa kluczowe, OG image" },
  { id: "plans",  label: "Plany cenowe",    icon: DollarSign, description: "Ceny STARTER i PREMIUM, miesięczne i roczne"     },
  { id: "limits", label: "Limity",          icon: Zap,        description: "Limity bajek na miesiąc per plan"                },
  { id: "faq",    label: "FAQ",             icon: HelpCircle, description: "Często zadawane pytania wyświetlane użytkownikom" },
  { id: "legal",  label: "Regulamin/Prawne",icon: FileText,   description: "URL regulaminu, polityki, dane firmy"            },
];

async function loadSettings() {
  const rows = await prisma.systemSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
}

function sv(settings: Record<string, unknown>, key: string, fallback = ""): string {
  const v = settings[key];
  return typeof v === "string" ? v : String(v ?? fallback);
}
function sn(settings: Record<string, unknown>, key: string, fallback = 0): number {
  const v = settings[key];
  return typeof v === "number" ? v : Number(v ?? fallback);
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { section?: string; saved?: string };
}) {
  const settings = await loadSettings();
  const activeSection = (searchParams.section ?? "app") as SectionId;
  const justSaved = searchParams.saved === "1";

  // FAQ — parse JSON array
  let faqItems: Array<{ q: string; a: string }> = [];
  try {
    const raw = settings["faq.items"];
    if (Array.isArray(raw)) faqItems = raw as Array<{ q: string; a: string }>;
  } catch { /* ignore */ }

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Nagłówek */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Ustawienia systemowe</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Konfiguracja platformy Bajkowy Świat. Zmiany są natychmiast aktywne.
          </p>
        </div>

        {justSaved && (
          <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
            ✓ Ustawienia zostały zapisane pomyślnie.
          </div>
        )}

        <div className="flex gap-6">

          {/* ── Sidebar sekcji ─────────────────────────────────────────── */}
          <div className="w-52 shrink-0 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`/admin/ustawienia?section=${id}`}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  activeSection === id
                    ? "bg-orange-500/10 text-orange-700 border border-orange-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${activeSection === id ? "text-orange-600" : "text-slate-400"}`} />
                {label}
              </a>
            ))}
          </div>

          {/* ── Zawartość sekcji ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">

              {/* Tytuł sekcji */}
              {SECTIONS.filter((s) => s.id === activeSection).map(({ label, icon: Icon, description }) => (
                <div key={label} className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                    <Icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900">{label}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                  </div>
                </div>
              ))}

              {/* Formularze */}
              {activeSection === "app" && (
                <SettingsAppForm
                  appName={sv(settings, "app.name", "Bajkowy Świat")}
                  appTagline={sv(settings, "app.tagline")}
                  contactEmail={sv(settings, "app.contact_email")}
                  supportEmail={sv(settings, "app.support_email")}
                  fromName={sv(settings, "app.from_name")}
                />
              )}
              {activeSection === "seo" && (
                <SettingsSeoForm
                  title={sv(settings, "seo.title")}
                  description={sv(settings, "seo.description")}
                  keywords={sv(settings, "seo.keywords")}
                  ogImage={sv(settings, "seo.og_image")}
                />
              )}
              {activeSection === "plans" && (
                <SettingsPlansForm
                  starterMonthly={sn(settings, "plans.starter.monthly_price", 1900)}
                  starterYearly={sn(settings, "plans.starter.yearly_price", 19000)}
                  premiumMonthly={sn(settings, "plans.premium.monthly_price", 4900)}
                  premiumYearly={sn(settings, "plans.premium.yearly_price", 49000)}
                />
              )}
              {activeSection === "limits" && (
                <SettingsLimitsForm
                  freeLimit={sn(settings, "limits.free.stories_per_month", 3)}
                  starterLimit={sn(settings, "limits.starter.stories_per_month", 15)}
                  premiumLimit={sn(settings, "limits.premium.stories_per_month", 50)}
                  maxProfiles={sn(settings, "limits.max_child_profiles", 5)}
                />
              )}
              {activeSection === "faq" && (
                <SettingsFaqForm items={faqItems} />
              )}
              {activeSection === "legal" && (
                <SettingsLegalForm
                  termsUrl={sv(settings, "legal.terms_url", "/regulamin")}
                  privacyUrl={sv(settings, "legal.privacy_url", "/polityka-prywatnosci")}
                  cookiesUrl={sv(settings, "legal.cookies_url", "/polityka-cookies")}
                  company={sv(settings, "legal.company")}
                  nip={sv(settings, "legal.nip")}
                  address={sv(settings, "legal.address")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
