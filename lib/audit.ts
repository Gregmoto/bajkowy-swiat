/**
 * lib/audit.ts
 * Helper do zapisywania logów akcji administracyjnych.
 * Wywoływany ze Server Actions — nigdy nie rzuca, żeby nie blokować głównej akcji.
 */

import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export interface AuditLogParams {
  /** userId admina, który wykonał akcję */
  userId: string | null;
  /** Typ akcji, np. "user.ban", "story.delete", "subscription.cancel" */
  action: string;
  /** Klasa zasobu, np. "User", "Story", "Subscription" */
  resource?: string;
  /** ID zmienionego rekordu */
  resourceId?: string;
  /** Dowolne dane kontekstowe (before/after, opis zmiany) */
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;

    try {
      const hdrs = await headers();
      ip =
        hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        hdrs.get("x-real-ip") ??
        null;
      userAgent = hdrs.get("user-agent") ?? null;
    } catch {
      // headers() może być niedostępny poza kontekstem żądania HTTP
    }

    await prisma.auditLog.create({
      data: {
        userId:     params.userId,
        action:     params.action,
        resource:   params.resource,
        resourceId: params.resourceId,
        metadata:   params.metadata ? (params.metadata as object) : undefined,
        ipAddress:  ip,
        userAgent,
      },
    });
  } catch (err) {
    // Błąd audytu nigdy nie może przerwać głównej operacji
    console.error("[audit] Failed to write log:", err);
  }
}

// ---------------------------------------------------------------------------
// Stałe — nazwy akcji
// ---------------------------------------------------------------------------
export const AUDIT_ACTIONS = {
  // Użytkownicy
  USER_BAN:            "user.ban",
  USER_UNBAN:          "user.unban",
  USER_DELETE:         "user.delete",
  USER_ROLE_CHANGE:    "user.role_change",
  USER_NOTE_UPDATE:    "user.note_update",
  USER_FLAG:           "user.flag",
  USER_UNFLAG:         "user.unflag",

  // Bajki
  STORY_DELETE:        "story.delete",
  STORY_STATUS_CHANGE: "story.status_change",

  // Subskrypcje
  SUB_CANCEL:          "subscription.cancel",
  SUB_RESTORE:         "subscription.restore",
  SUB_PLAN_CHANGE:     "subscription.plan_change",
  SUB_BILLING_CHANGE:  "subscription.billing_period_change",

  // Płatności
  PAYMENT_STATUS:      "payment.status_change",

  // Profile dzieci
  PROFILE_DELETE:      "child_profile.delete",

  // Zgłoszenia / tickety
  TICKET_STATUS:       "ticket.status_change",
  TICKET_NOTE:         "ticket.message_add",

  // Stare raporty
  REPORT_STATUS:       "report.status_change",
} as const;
