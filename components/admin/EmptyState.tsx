import { LucideIcon } from "lucide-react";

interface Props {
  icon?:        LucideIcon;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-4">
          <Icon className="h-7 w-7 text-slate-400" />
        </div>
      )}
      <p className="text-base font-black text-slate-700">{title}</p>
      {description && <p className="mt-1.5 text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
