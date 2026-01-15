import { useEffect, useState } from "react";
import { Home, Calendar, FileSearch, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const baseNavItems: Omit<NavItem, 'badge'>[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: Bell, label: "Avisos", path: "/avisos" },
  { icon: FileSearch, label: "Histórico", path: "/historico" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingAlertsCount, setPendingAlertsCount] = useState(0);

  useEffect(() => {
    const fetchPendingAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { count, error } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("target_type", "client")
        .in("status", ["scheduled", "sent"]);

      if (!error && count !== null) {
        setPendingAlertsCount(count);
      }
    };

    fetchPendingAlerts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("alerts-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => fetchPendingAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navItems: NavItem[] = baseNavItems.map((item) => ({
    ...item,
    badge: item.path === "/avisos" ? pendingAlertsCount : undefined,
  }));

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
                <div className="relative">
                  <item.icon
                    className={cn(
                      "h-6 w-6 transition-transform duration-300",
                      isActive && "scale-110"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 animate-pulse">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
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
