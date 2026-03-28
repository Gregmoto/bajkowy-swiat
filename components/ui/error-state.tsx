import * as React from "react";
import { AlertTriangle, RefreshCw, WifiOff, Lock, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ErrorVariant = "default" | "notFound" | "unauthorized" | "network" | "empty";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  size?: "sm" | "default";
}

const VARIANT_CONFIG: Record<
  ErrorVariant,
  { icon: React.ReactNode; title: string; description: string; iconColor: string; bgColor: string }
> = {
  default: {
    icon: <AlertTriangle className="h-8 w-8" />,
    title: "Coś poszło nie tak",
    description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
  },
  notFound: {
    icon: <SearchX className="h-8 w-8" />,
    title: "Nie znaleziono",
    description: "Szukany zasób nie istnieje lub został usunięty.",
    iconColor: "text-slate-400",
    bgColor: "bg-slate-50",
  },
  unauthorized: {
    icon: <Lock className="h-8 w-8" />,
    title: "Brak dostępu",
    description: "Nie masz uprawnień do wyświetlenia tej zawartości.",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  network: {
    icon: <WifiOff className="h-8 w-8" />,
    title: "Błąd połączenia",
    description: "Sprawdź połączenie z internetem i spróbuj ponownie.",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-50",
  },
  empty: {
    icon: <SearchX className="h-8 w-8" />,
    title: "Brak wyników",
    description: "Nie znaleziono żadnych elementów spełniających kryteria.",
    iconColor: "text-slate-400",
    bgColor: "bg-slate-50",
  },
};

export function ErrorState({
  variant = "default",
  title,
  description,
  onRetry,
  retryLabel = "Spróbuj ponownie",
  size = "default",
  className,
  ...props
}: ErrorStateProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl text-center",
        size === "default" ? "py-16 px-8" : "py-10 px-6",
        className
      )}
      role="alert"
      {...props}
    >
      <div className={cn("flex items-center justify-center rounded-2xl p-4", cfg.bgColor)}>
        <span className={cfg.iconColor}>{cfg.icon}</span>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <h3 className={cn("font-bold text-slate-800", size === "sm" ? "text-sm" : "text-base")}>
          {title ?? cfg.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description ?? cfg.description}
        </p>
      </div>

      {onRetry && (
        <Button variant="outline" size={size === "sm" ? "sm" : "default"} onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
