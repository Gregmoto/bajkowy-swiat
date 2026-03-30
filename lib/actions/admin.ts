"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SubscriptionPlan, ReportStatus, UserRole, SubscriptionStatus } from "@prisma/client";
import { writeAuditLog, AUDIT_ACTIONS } from "@/lib/audit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Brak uprawnień administratora.");
  return session;
}

export type AdminResult = { error: string } | null;

// ---------------------------------------------------------------------------
// UŻYTKOWNICY
// ---------------------------------------------------------------------------

export async function toggleBanUser(userId: string): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isBanned: true, email: true } });
    if (!user) return { error: "Użytkownik nie istnieje." };
    const newBanned = !user.isBanned;
    await prisma.user.update({ where: { id: userId }, data: { isBanned: newBanned } });
    await writeAuditLog({
      userId: session.userId, action: newBanned ? AUDIT_ACTIONS.USER_BAN : AUDIT_ACTIONS.USER_UNBAN,
      resource: "User", resourceId: userId, metadata: { email: user.email, was: user.isBanned, now: newBanned },
    });
    revalidatePath("/admin/uzytkownicy"); revalidatePath(`/admin/uzytkownicy/${userId}`);
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

export async function changeUserRole(userId: string, role: UserRole): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    if (userId === session.userId) return { error: "Nie możesz zmienić własnej roli." };
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } });
    if (!user) return { error: "Użytkownik nie istnieje." };
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      resource: "User", resourceId: userId, metadata: { email: user.email, from: user.role, to: role },
    });
    revalidatePath("/admin/uzytkownicy"); revalidatePath(`/admin/uzytkownicy/${userId}`);
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

export async function changeUserPlan(userId: string, plan: SubscriptionPlan): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const sub = await prisma.subscription.findUnique({ where: { userId }, select: { plan: true } });
    await prisma.subscription.update({ where: { userId }, data: { plan } });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.SUB_PLAN_CHANGE,
      resource: "Subscription", resourceId: userId, metadata: { targetUserId: userId, from: sub?.plan, to: plan },
    });
    revalidatePath("/admin/uzytkownicy"); revalidatePath(`/admin/uzytkownicy/${userId}`); revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

export async function deleteUser(userId: string): Promise<void> {
  const session = await verifyAdmin();
  if (userId === session.userId) throw new Error("Nie możesz usunąć własnego konta.");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  await prisma.user.delete({ where: { id: userId } });
  await writeAuditLog({
    userId: session.userId, action: AUDIT_ACTIONS.USER_DELETE,
    resource: "User", resourceId: userId, metadata: { email: user?.email, name: user?.name },
  });
  revalidatePath("/admin/uzytkownicy");
  redirect("/admin/uzytkownicy");
}

// ---------------------------------------------------------------------------
// BAJKI
// ---------------------------------------------------------------------------

export async function deleteStoryAdmin(storyId: string): Promise<void> {
  const session = await verifyAdmin();
  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true, userId: true } });
  await prisma.story.delete({ where: { id: storyId } });
  await writeAuditLog({
    userId: session.userId, action: AUDIT_ACTIONS.STORY_DELETE,
    resource: "Story", resourceId: storyId, metadata: { title: story?.title, ownerId: story?.userId },
  });
  revalidatePath("/admin/bajki");
  redirect("/admin/bajki");
}

export async function changeStoryStatus(storyId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { status: true, title: true } });
    await prisma.story.update({ where: { id: storyId }, data: { status } });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.STORY_STATUS_CHANGE,
      resource: "Story", resourceId: storyId, metadata: { title: story?.title, from: story?.status, to: status },
    });
    revalidatePath("/admin/bajki"); revalidatePath(`/admin/bajki/${storyId}`);
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

// ---------------------------------------------------------------------------
// PROFILE DZIECI
// ---------------------------------------------------------------------------

export async function deleteChildProfileAdmin(profileId: string): Promise<void> {
  const session = await verifyAdmin();
  const profile = await prisma.childProfile.findUnique({ where: { id: profileId }, select: { name: true, userId: true } });
  await prisma.childProfile.delete({ where: { id: profileId } });
  await writeAuditLog({
    userId: session.userId, action: AUDIT_ACTIONS.PROFILE_DELETE,
    resource: "ChildProfile", resourceId: profileId, metadata: { name: profile?.name, ownerId: profile?.userId },
  });
  revalidatePath("/admin/dzieci");
  redirect("/admin/dzieci");
}

// ---------------------------------------------------------------------------
// NOTATKI I FLAGI
// ---------------------------------------------------------------------------

export async function saveAdminNote(userId: string, note: string): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    await prisma.user.update({ where: { id: userId }, data: { adminNote: note.trim() || null } });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.USER_NOTE_UPDATE,
      resource: "User", resourceId: userId, metadata: { hasNote: !!note.trim() },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`);
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

export async function toggleFlagUser(userId: string): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { flaggedForReview: true } });
    if (!user) return { error: "Użytkownik nie istnieje." };
    const newFlag = !user.flaggedForReview;
    await prisma.user.update({ where: { id: userId }, data: { flaggedForReview: newFlag } });
    await writeAuditLog({
      userId: session.userId, action: newFlag ? AUDIT_ACTIONS.USER_FLAG : AUDIT_ACTIONS.USER_UNFLAG,
      resource: "User", resourceId: userId, metadata: { now: newFlag },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`); revalidatePath("/admin/uzytkownicy");
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

// ---------------------------------------------------------------------------
// SUBSKRYPCJE
// ---------------------------------------------------------------------------

export async function cancelSubscription(userId: string): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const sub = await prisma.subscription.findUnique({ where: { userId }, select: { plan: true, status: true } });
    await prisma.subscription.update({
      where: { userId },
      data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date(), cancelAtPeriodEnd: true },
    });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.SUB_CANCEL,
      resource: "Subscription", resourceId: userId, metadata: { targetUserId: userId, plan: sub?.plan, wasStatus: sub?.status },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`); revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

export async function restoreSubscription(userId: string): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    await prisma.subscription.update({
      where: { userId },
      data: { status: SubscriptionStatus.ACTIVE, canceledAt: null, cancelAtPeriodEnd: false },
    });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.SUB_RESTORE,
      resource: "Subscription", resourceId: userId, metadata: { targetUserId: userId },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`); revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

export async function changeBillingPeriod(userId: string, period: "MONTHLY" | "YEARLY"): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const sub = await prisma.subscription.findUnique({ where: { userId }, select: { billingPeriod: true } });
    await prisma.subscription.update({ where: { userId }, data: { billingPeriod: period } });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.SUB_BILLING_CHANGE,
      resource: "Subscription", resourceId: userId, metadata: { targetUserId: userId, from: sub?.billingPeriod, to: period },
    });
    revalidatePath(`/admin/uzytkownicy/${userId}`); revalidatePath("/admin/subskrypcje");
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

// ---------------------------------------------------------------------------
// ZGŁOSZENIA (stary Report model)
// ---------------------------------------------------------------------------

export async function updateReportStatus(reportId: string, status: ReportStatus, adminNote?: string): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const report = await prisma.report.findUnique({ where: { id: reportId }, select: { status: true, subject: true } });
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNote: adminNote ?? undefined,
        resolvedById: status === "RESOLVED" || status === "CLOSED" ? session.userId : undefined,
        resolvedAt:   status === "RESOLVED" || status === "CLOSED" ? new Date() : undefined,
      },
    });
    await writeAuditLog({
      userId: session.userId, action: AUDIT_ACTIONS.REPORT_STATUS,
      resource: "Report", resourceId: reportId, metadata: { subject: report?.subject, from: report?.status, to: status },
    });
    revalidatePath("/admin/zgloszenia");
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

// ---------------------------------------------------------------------------
// Oznacz / odznacz bajkę do moderacji
// ---------------------------------------------------------------------------
export async function flagStoryAdmin(
  storyId: string,
  flagged: boolean
): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } });
    if (!story) return { error: "Bajka nie istnieje" };
    await prisma.story.update({ where: { id: storyId }, data: { flaggedForModeration: flagged } });
    await writeAuditLog({
      userId: session.userId,
      action: flagged ? AUDIT_ACTIONS.STORY_FLAG : AUDIT_ACTIONS.STORY_UNFLAG,
      resource: "Story",
      resourceId: storyId,
      metadata: { title: story.title },
    });
    revalidatePath("/admin/bajki");
    revalidatePath(`/admin/bajki/${storyId}`);
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}

// ---------------------------------------------------------------------------
// Edytuj metadane bajki (tytuł, morał, streszczenie)
// ---------------------------------------------------------------------------
export async function editStoryMetadata(
  storyId: string,
  data: { title?: string; moral?: string; summary?: string }
): Promise<AdminResult> {
  try {
    const session = await verifyAdmin();
    await prisma.story.update({ where: { id: storyId }, data });
    await writeAuditLog({
      userId: session.userId,
      action: AUDIT_ACTIONS.STORY_EDIT_META,
      resource: "Story",
      resourceId: storyId,
      metadata: data,
    });
    revalidatePath("/admin/bajki");
    revalidatePath(`/admin/bajki/${storyId}`);
    return null;
  } catch (err) { return { error: err instanceof Error ? err.message : "Nieznany błąd." }; }
}
