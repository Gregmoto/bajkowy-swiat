import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}
const SPINNER_SIZE = { sm: "h-4 w-4", default: "h-7 w-7", lg: "h-10 w-10" };

export function Spinner({ size = "default", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-orange-500", SPINNER_SIZE[size], className)}
    />
  );
}

// ── PageLoading — pełna strona ────────────────────────────────────────────────

export function PageLoading({ label = "Ładowanie…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

// ── SectionLoading — sekcja / widget ─────────────────────────────────────────

export function SectionLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Spinner />
    </div>
  );
}

// ── SkeletonCard — karta bajki ────────────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 space-y-3", className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── SkeletonCards — siatka kart ───────────────────────────────────────────────

export function SkeletonCards({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── SkeletonList — lista wierszy ──────────────────────────────────────────────

export function SkeletonList({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── SkeletonText — blok tekstu ────────────────────────────────────────────────

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
