import { Home, Calendar, FileSearch, Rocket } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileSearch, label: "Histórico", path: "/historico" },
  { icon: Rocket, label: "Performance", path: "/performance" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
      <div className="glass-card mx-4 mb-4 rounded-2xl">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 touch-target",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-8 rounded-full gradient-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
