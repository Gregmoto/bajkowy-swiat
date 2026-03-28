"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SubscriptionPlan, ReportStatus, UserRole, SubscriptionStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Brak uprawnień administratora.");
  }
  return session;
}

export type AdminResult = { error: string } | null;

// ---------------------------------------------------------------------------
// UŻYTKOWNICY
// ---------------------------------------------------------------------------

/** Zbanuj / Odbanuj użytkownika */
export async function toggleBanUser(userId: string): Promise<AdminResult> {
  try {
    await verifyAdmin();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true },
    });
    if (!user) return { error: "Użytkownik nie istnieje." };
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });
    revalidatePath("/admin/uzytkownicy");
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Zmień rolę użytkownika (USER ↔ ADMIN) */
export async function changeUserRole(userId: string, role: UserRole): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    if (userId === session.userId) return { error: "Nie możesz zmienić własnej roli." };
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin/uzytkownicy");
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Zmień plan subskrypcji użytkownika */
export async function changeUserPlan(userId: string, plan: SubscriptionPlan): Promise<AdminResult> {
  try {
    await verifyAdmin();
    await prisma.subscription.update({ where: { userId }, data: { plan } });
    revalidatePath("/admin/uzytkownicy");
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Usuń użytkownika (kaskadowo) */
export async function deleteUser(userId: string): Promise<void> {
  const session = await verifyAdmin();
  if (userId === session.userId) throw new Error("Nie możesz usunąć własnego konta.");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/uzytkownicy");
  redirect("/admin/uzytkownicy");
}

// ---------------------------------------------------------------------------
// BAJKI
// ---------------------------------------------------------------------------

/** Usuń bajkę */
export async function deleteStoryAdmin(storyId: string): Promise<void> {
  await verifyAdmin();
  await prisma.story.delete({ where: { id: storyId } });
  revalidatePath("/admin/bajki");
  redirect("/admin/bajki");
}

/** Zmień status bajki */
export async function changeStoryStatus(
  storyId: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<AdminResult> {
  try {
    await verifyAdmin();
    await prisma.story.update({ where: { id: storyId }, data: { status } });
    revalidatePath("/admin/bajki");
    revalidatePath(`/admin/bajki/${storyId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

// ---------------------------------------------------------------------------
// PROFILE DZIECI
// ---------------------------------------------------------------------------

/** Usuń profil dziecka */
export async function deleteChildProfileAdmin(profileId: string): Promise<void> {
  await verifyAdmin();
  await prisma.childProfile.delete({ where: { id: profileId } });
  revalidatePath("/admin/dzieci");
  redirect("/admin/dzieci");
}

// ---------------------------------------------------------------------------
// ZGŁOSZENIA
// ---------------------------------------------------------------------------

/** Zapisz notatkę admina do użytkownika */
export async function saveAdminNote(userId: string, note: string): Promise<AdminResult> {
  try {
    await verifyAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { adminNote: note.trim() || null },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Oznacz / odznacz konto do weryfikacji */
export async function toggleFlagUser(userId: string): Promise<AdminResult> {
  try {
    await verifyAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { flaggedForReview: true } });
    if (!user) return { error: "Użytkownik nie istnieje." };
    await prisma.user.update({
      where: { id: userId },
      data: { flaggedForReview: !user.flaggedForReview },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    revalidatePath("/admin/uzytkownicy");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

// ---------------------------------------------------------------------------
// SUBSKRYPCJE
// ---------------------------------------------------------------------------

/** Anuluj subskrypcję użytkownika */
export async function cancelSubscription(userId: string): Promise<AdminResult> {
  try {
    await verifyAdmin();
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelAtPeriodEnd: true,
      },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Przywróć subskrypcję (CANCELED → ACTIVE) */
export async function restoreSubscription(userId: string): Promise<AdminResult> {
  try {
    await verifyAdmin();
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        canceledAt: null,
        cancelAtPeriodEnd: false,
      },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Zmień okres rozliczeniowy subskrypcji */
export async function changeBillingPeriod(
  userId: string,
  period: "MONTHLY" | "YEARLY"
): Promise<AdminResult> {
  try {
    await verifyAdmin();
    await prisma.subscription.update({ where: { userId }, data: { billingPeriod: period } });
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Aktualizuj status zgłoszenia */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNote?: string
): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNote: adminNote ?? undefined,
        resolvedById: status === "RESOLVED" || status === "CLOSED" ? session.userId : undefined,
        resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : undefined,
      },
    });
    revalidatePath("/admin/zgloszenia");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}
