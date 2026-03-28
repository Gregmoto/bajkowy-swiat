import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import DzieckoForm from "@/components/dzieci/DzieckoForm";

export const metadata: Metadata = {
  title: "Edytuj profil dziecka — Bajkowy Świat",
};

interface Props {
  params: { id: string };
}

export default async function EdytujDzieckoPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dziecko = await prisma.childProfile.findUnique({
    where: { id: params.id },
  });

  if (!dziecko || dziecko.userId !== session.userId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">Edytuj profil dziecka</h1>
        <p className="text-muted-foreground">
          Zaktualizuj informacje o {dziecko.name}.
        </p>
      </div>
      <DzieckoForm dzieckoId={dziecko.id} defaultValues={dziecko} />
    </div>
  );
}
