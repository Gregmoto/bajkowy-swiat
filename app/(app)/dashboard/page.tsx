import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import PowitanieWidget from "@/components/dashboard/PowitanieWidget";
import StatystykiWidget from "@/components/dashboard/StatystykiWidget";
import ProfileDzieciWidget from "@/components/dashboard/ProfileDzieciWidget";
import OstatnieBajkiWidget from "@/components/dashboard/OstatnieBajkiWidget";
import SzybkieAkcje from "@/components/dashboard/SzybkieAkcje";

export const metadata: Metadata = {
  title: "Dashboard — Bajkowy Świat",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [profile, stories, liczbaDzieci, liczbaHistorii] = await Promise.all([
    prisma.childProfile.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    prisma.story.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { childProfile: { select: { name: true, avatar: true } } },
    }),
    prisma.childProfile.count({ where: { userId: session.userId } }),
    prisma.story.count({ where: { userId: session.userId } }),
  ]);

  return (
    <div className="space-y-6">
      <PowitanieWidget imie={session.name.split(" ")[0]} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatystykiWidget liczbaBajek={liczbaHistorii} liczbaDzieci={liczbaDzieci} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <OstatnieBajkiWidget bajki={stories} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <ProfileDzieciWidget profile={profile} />
          <SzybkieAkcje maProfile={liczbaDzieci > 0} />
        </div>
      </div>
    </div>
  );
}
