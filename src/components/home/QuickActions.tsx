import { CalendarPlus, FileSearch, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    icon: CalendarPlus,
    label: "Agendar",
    color: "text-primary",
    bgColor: "bg-primary/15",
  },
  {
    icon: FileSearch,
    label: "Histórico",
    color: "text-foreground",
    bgColor: "bg-secondary",
  },
  {
    icon: MessageCircle,
    label: "Chat",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Phone,
    label: "Ligar",
    color: "text-foreground",
    bgColor: "bg-secondary",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3 animate-fade-in">
      {actions.map((action) => (
        <button
          key={action.label}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300",
            "hover:scale-105 active:scale-95 touch-target",
            action.bgColor
          )}
        >
          <action.icon className={cn("w-6 h-6", action.color)} strokeWidth={1.5} />
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
