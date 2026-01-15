import { Home, Calendar, FileSearch, Wrench, Settings, Users, BarChart3, LogOut, Plus, Car, Star, TrendingUp, DollarSign } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";

const clientItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Histórico", url: "/historico", icon: FileSearch },
  { title: "Serviços", url: "/servicos", icon: Wrench },
];

type AdminMenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const adminItems: AdminMenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: BarChart3, roles: ["admin", "oficina"] },
  { title: "Nova OS", url: "/admin/nova-os", icon: Plus, roles: ["admin", "oficina"] },
  { title: "Pátio", url: "/admin/patio", icon: Car, roles: ["admin", "oficina"] },
  { title: "Agendamentos", url: "/admin/agendamentos", icon: Calendar, roles: ["admin", "oficina"] },
  { title: "Feedback Mecânicos", url: "/admin/feedback-mecanicos", icon: Star, roles: ["admin", "oficina"] },
  { title: "Analytics Mecânicos", url: "/admin/analytics-mecanicos", icon: TrendingUp, roles: ["admin"] },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, roles: ["admin"] },
  { title: "Clientes", url: "/admin/clientes", icon: Users, roles: ["admin", "oficina"] },
  { title: "Serviços", url: "/admin/servicos", icon: Wrench, roles: ["admin", "oficina"] },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings, roles: ["admin", "oficina"] },
];

interface AppSidebarProps {
  variant?: "client" | "admin";
}

export function AppSidebar({ variant = "client" }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { role } = useUserRole();
  const collapsed = state === "collapsed";

  // Filter admin items based on user role
  const filteredAdminItems = adminItems.filter(item => 
    role && item.roles.includes(role)
  );

  const items = variant === "admin" ? filteredAdminItems : clientItems;
  const groupLabel = variant === "admin" ? "Oficina" : "Menu";

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all",
          collapsed && "justify-center"
        )}>
          <img 
            src="/logo.png" 
            alt="Doctor Auto Prime" 
            className="w-8 h-8 rounded-lg object-contain"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm">Doctor Auto Prime</span>
              <span className="text-xs text-muted-foreground">
                {variant === "admin" ? "Painel Admin" : "Cliente"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              {groupLabel}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/" || item.url === "/admin"}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                        "hover:bg-muted/50"
                      )}
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
