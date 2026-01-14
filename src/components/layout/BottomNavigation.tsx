import { Home, Calendar, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", active: true },
  { icon: Calendar, label: "Agenda" },
  { icon: FileSearch, label: "Histórico" },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
      <div className="glass-card mx-4 mb-4 rounded-2xl">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 touch-target",
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform duration-300",
                  item.active && "scale-110"
                )}
                strokeWidth={item.active ? 2.5 : 1.5}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {item.active && (
                <span className="absolute -bottom-1 h-1 w-8 rounded-full gradient-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
