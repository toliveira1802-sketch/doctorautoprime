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
    label: "Veículo",
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
    <div className="flex gap-3 animate-fade-in">
      {actions.map((action) => (
        <button
          key={action.label}
          className={cn(
            "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300",
            "glass-card hover:scale-105 active:scale-95 touch-target"
          )}
        >
          <action.icon className={cn("w-6 h-6", action.color)} strokeWidth={1.5} />
          <div className="text-center">
            <span className="text-sm font-medium text-foreground block">{action.label}</span>
            <span className="text-xs text-muted-foreground">{action.subtitle}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
