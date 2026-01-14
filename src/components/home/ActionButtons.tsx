import { Car, Bell, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButton {
  icon: React.ElementType;
  label: string;
  subtitle: string;
  color: string;
}

const actions: ActionButton[] = [
  {
    icon: Car,
    label: "Veículos",
    subtitle: "Honda HR-V",
    color: "text-primary",
  },
  {
    icon: Bell,
    label: "Lembrete",
    subtitle: "2 pendentes",
    color: "text-amber-500",
  },
  {
    icon: Megaphone,
    label: "Avisos",
    subtitle: "1 promoção",
    color: "text-emerald-500",
  },
];

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {actions.map((action) => (
        <button
          key={action.label}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
            "glass-card hover:scale-[1.02] active:scale-[0.98] touch-target text-left"
          )}
        >
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50")}>
            <action.icon className={cn("w-6 h-6", action.color)} strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-base font-medium text-foreground block">{action.label}</span>
            <span className="text-sm text-muted-foreground">{action.subtitle}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
