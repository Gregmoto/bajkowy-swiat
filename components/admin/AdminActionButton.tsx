"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  label: string;
  confirmMessage?: string;
  action: () => Promise<unknown>;
  variant?: "danger" | "warning" | "default" | "success";
  className?: string;
}

const VARIANT_STYLE: Record<string, string> = {
  danger:  "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200",
  warning: "text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200",
  success: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200",
  default: "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200",
};

export default function AdminActionButton({
  label,
  confirmMessage,
  action,
  variant = "default",
  className,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_STYLE[variant]} ${className ?? ""}`}
    >
      {isPending ? "…" : label}
    </button>
  );
}
