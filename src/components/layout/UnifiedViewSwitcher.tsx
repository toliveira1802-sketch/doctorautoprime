import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Settings, BarChart3 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

type ViewType = "cliente" | "admin" | "gestao";

interface ViewConfig {
  id: ViewType;
  label: string;
  icon: typeof Home;
  path: string;
  checkAccess: (role: string | null) => boolean;
}

const VIEWS: ViewConfig[] = [
  {
    id: "cliente",
    label: "Cliente",
    icon: Home,
    path: "/",
    checkAccess: () => true, // Todos podem acessar visão cliente
  },
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    path: "/admin",
    checkAccess: (role) => ["admin", "gestao", "dev"].includes(role || ""),
  },
  {
    id: "gestao",
    label: "Gestão",
    icon: BarChart3,
    path: "/gestao",
    checkAccess: (role) => ["gestao", "dev"].includes(role || ""),
  },
];

interface UnifiedViewSwitcherProps {
  variant?: "buttons" | "compact";
  className?: string;
}

export function UnifiedViewSwitcher({ 
  variant = "buttons",
  className 
}: UnifiedViewSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useUserRole();

  const getCurrentView = (): ViewType => {
    if (location.pathname.startsWith("/gestao")) return "gestao";
    if (location.pathname.startsWith("/admin")) return "admin";
    return "cliente";
  };

  const currentView = getCurrentView();

  // Filtrar views baseado nas permissões do usuário
  const availableViews = VIEWS.filter((view) => view.checkAccess(role));

  // Se só tem uma view disponível, não mostrar o switcher
  if (availableViews.length <= 1) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1 bg-muted/50 rounded-lg p-1", className)}>
        {availableViews.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => navigate(view.path)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                currentView === view.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={view.label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant: buttons (padrão)
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {availableViews.map((view) => {
        const Icon = view.icon;
        return (
          <Button
            key={view.id}
            variant={currentView === view.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-2",
              currentView === view.id && "bg-primary hover:bg-primary/90"
            )}
            onClick={() => navigate(view.path)}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
