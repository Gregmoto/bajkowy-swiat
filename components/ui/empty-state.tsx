import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Duże emoji lub ikona */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  /** Rozmiar: "sm" dla sekcji, "default" dla strony */
  size?: "sm" | "default";
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  secondaryAction,
  size = "default",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center",
        size === "default" ? "py-20 px-8" : "py-12 px-6",
        className
      )}
      {...props}
    >
      <div className={cn("text-6xl", size === "sm" && "text-4xl")}>
        {typeof icon === "string" ? icon : <span className="text-slate-300">{icon}</span>}
      </div>

      <div className="space-y-1.5 max-w-xs">
        <h3 className={cn("font-bold text-slate-700", size === "sm" ? "text-sm" : "text-base")}>
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
          {action && (
            action.href ? (
              <Button asChild size={size === "sm" ? "sm" : "default"}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button size={size === "sm" ? "sm" : "default"} onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="ghost" size={size === "sm" ? "sm" : "default"} asChild>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="ghost" size={size === "sm" ? "sm" : "default"} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
