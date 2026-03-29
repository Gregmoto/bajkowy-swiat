"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import { writeAuditLog, AUDIT_ACTIONS } from "@/lib/audit";

export type SupportResult = { error: string } | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Wymagane logowanie.");
  return session;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Brak uprawnień.");
  return session;
}

// ---------------------------------------------------------------------------
// UŻYTKOWNIK — tworzenie zgłoszenia
// ---------------------------------------------------------------------------

export interface CreateTicketInput {
  subject:     string;
  description: string;
  category:    TicketCategory;
  priority?:   TicketPriority;
}

export async function createTicket(input: CreateTicketInput): Promise<{ id: string } | { error: string }> {
  try {
    const session = await requireSession();

    if (!input.subject.trim())     return { error: "Temat nie może być pusty." };
    if (!input.description.trim()) return { error: "Treść nie może być pusta." };

    const ticket = await prisma.supportTicket.create({
      data: {
        userId:      session.userId,
        subject:     input.subject.trim(),
        description: input.description.trim(),
        category:    input.category,
        priority:    input.priority ?? "NORMAL",
        status:      "OPEN",
      },
    });

    return { id: ticket.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

// ---------------------------------------------------------------------------
// ADMIN — zarządzanie ticketami
// ---------------------------------------------------------------------------

/** Zmień status ticketu */
export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportResult> {
  try {
    const session = await requireAdmin();
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { status: true, subject: true },
    });
    if (!ticket) return { error: "Zgłoszenie nie istnieje." };

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: status === "RESOLVED"                       ? new Date() : undefined,
        closedAt:   status === "CLOSED"                         ? new Date() : undefined,
        assignedTo: status === "IN_PROGRESS" && !ticket.status  ? session.userId : undefined,
      },
    });

    await writeAuditLog({
      userId:     session.userId,
      action:     AUDIT_ACTIONS.TICKET_STATUS,
      resource:   "SupportTicket",
      resourceId: ticketId,
      metadata:   { subject: ticket.subject, from: ticket.status, to: status },
    });

    revalidatePath("/admin/zgloszenia");
    revalidatePath(`/admin/zgloszenia/${ticketId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Zmień priorytet ticketu */
export async function updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<SupportResult> {
  try {
    await requireAdmin();
    await prisma.supportTicket.update({ where: { id: ticketId }, data: { priority } });
    revalidatePath("/admin/zgloszenia");
    revalidatePath(`/admin/zgloszenia/${ticketId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Przypisz ticket do admina */
export async function assignTicket(ticketId: string, adminId: string | null): Promise<SupportResult> {
  try {
    await requireAdmin();
    await prisma.supportTicket.update({ where: { id: ticketId }, data: { assignedTo: adminId } });
    revalidatePath(`/admin/zgloszenia/${ticketId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Dodaj wiadomość / notatkę wewnętrzną do ticketu */
export async function addTicketMessage(
  ticketId: string,
  content: string,
  isInternal: boolean
): Promise<SupportResult> {
  try {
    const session = await requireSession();
    if (!content.trim()) return { error: "Wiadomość nie może być pusta." };

    // Tylko admin może dodawać notatki wewnętrzne
    if (isInternal && session.role !== "ADMIN") return { error: "Brak uprawnień." };

    await prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId:   session.userId,
        content:    content.trim(),
        isInternal,
      },
    });

    if (isInternal) {
      await writeAuditLog({
        userId:     session.userId,
        action:     AUDIT_ACTIONS.TICKET_NOTE,
        resource:   "SupportTicket",
        resourceId: ticketId,
        metadata:   { isInternal },
      });
    }

    // Jeśli admin odpowiada → zmień status na IN_PROGRESS (jeśli był OPEN)
    if (session.role === "ADMIN" && !isInternal) {
      await prisma.supportTicket.updateMany({
        where: { id: ticketId, status: "OPEN" },
        data:  { status: "IN_PROGRESS", assignedTo: session.userId },
      });
    }

    revalidatePath(`/admin/zgloszenia/${ticketId}`);
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nieznany błąd." };
  }
}

/** Usuń ticket (tylko admin) */
export async function deleteTicket(ticketId: string): Promise<void> {
  const session = await requireAdmin();
  await prisma.supportTicket.delete({ where: { id: ticketId } });
  await writeAuditLog({
    userId:     session.userId,
    action:     "ticket.delete",
    resource:   "SupportTicket",
    resourceId: ticketId,
  });
  revalidatePath("/admin/zgloszenia");
  redirect("/admin/zgloszenia");
}
