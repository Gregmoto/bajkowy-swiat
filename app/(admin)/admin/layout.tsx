import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Panel Admina — Bajkowy Świat" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Podwójne zabezpieczenie (middleware + layout)
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar adminName={session.name} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
