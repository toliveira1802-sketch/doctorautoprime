import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_EMAIL = "thales@doctorautoprime.com.br";

const views = [
  { id: "client", label: "Cliente", icon: Home, path: "/" },
  { id: "admin", label: "Admin", icon: Settings, path: "/admin" },
  { id: "gestao", label: "Gestão", icon: LayoutDashboard, path: "/gestao" },
];

export function ViewSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Only show for thales
  if (!user?.email?.toLowerCase().includes("thales")) {
    return null;
  }

  const getCurrentView = () => {
    if (location.pathname.startsWith("/gestao")) return "gestao";
    if (location.pathname.startsWith("/admin")) return "admin";
    return "client";
  };

  const currentView = getCurrentView();

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => navigate(view.path)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            currentView === view.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <view.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}
