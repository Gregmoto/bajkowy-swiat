import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// AppCard — the standard bordered card used throughout the app
const AppCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }
>(({ className, hoverable = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-slate-200 bg-white p-5",
      hoverable && "transition-all hover:shadow-md hover:border-slate-300",
      className
    )}
    {...props}
  />
));
AppCard.displayName = "AppCard";

// StatCard — used for dashboard stats (icon + number + label)
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: "orange" | "blue" | "green" | "purple";
}
const STAT_COLOR = {
  orange: { bg: "bg-orange-50", text: "text-orange-500" },
  blue:   { bg: "bg-blue-50",   text: "text-blue-500"   },
  green:  { bg: "bg-emerald-50",text: "text-emerald-500" },
  purple: { bg: "bg-violet-50", text: "text-violet-500"  },
};
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, value, label, color = "orange", className, ...props }, ref) => {
    const c = STAT_COLOR[color];
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4", className)}
        {...props}
      >
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", c.bg)}>
          <span className={cn("h-5 w-5", c.text)}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  AppCard,
  StatCard,
};
