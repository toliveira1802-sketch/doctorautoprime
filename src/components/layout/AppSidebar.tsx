import { 
  Home, Calendar, FileSearch, Wrench, Settings, Users, BarChart3, LogOut, 
  Plus, Car, Star, TrendingUp, DollarSign, FileText, ChevronDown,
  ClipboardList, Gauge, UserCog, LayoutDashboard
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ============================================
// CLIENT AREA MODULE
// ============================================
const clientItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Histórico", url: "/historico", icon: FileSearch },
  { title: "Serviços", url: "/servicos", icon: Wrench },
];

// ============================================
// ADMIN MODULES - Organized for future separation
// ============================================

type AdminMenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

type AdminMenuGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  items: AdminMenuItem[];
};

// MODULE: Operacional (oficina, gestao, direcao)
const operacionalModule: AdminMenuGroup = {
  label: "Operacional",
  icon: Gauge,
  roles: ["admin", "oficina"],
  items: [
    { title: "Nova OS", url: "/admin/nova-os", icon: Plus, roles: ["admin", "oficina"] },
    { title: "Pátio", url: "/admin/patio", icon: Car, roles: ["admin", "oficina"] },
    { title: "Agendamentos", url: "/admin/agendamentos", icon: Calendar, roles: ["admin", "oficina"] },
    { title: "Clientes", url: "/admin/clientes", icon: Users, roles: ["admin", "oficina"] },
    { title: "Cronograma", url: "/admin/agenda-mecanicos", icon: ClipboardList, roles: ["admin", "oficina"] },
  ],
};

// MODULE: Dashboard (consolidates analytics, feedback, financeiro)
const dashboardModule: AdminMenuGroup = {
  label: "Dashboard",
  icon: BarChart3,
  roles: ["admin", "oficina"],
  items: [
    { title: "Visão Geral", url: "/admin/dashboard", icon: BarChart3, roles: ["admin", "oficina"] },
    { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, roles: ["admin"] },
    { title: "Analytics Mecânicos", url: "/admin/analytics-mecanicos", icon: TrendingUp, roles: ["admin"] },
    { title: "Feedback Mecânicos", url: "/admin/feedback-mecanicos", icon: Star, roles: ["admin", "oficina"] },
  ],
};

// MODULE: Sistema (admin + oficina)
const sistemaModule: AdminMenuGroup = {
  label: "Sistema",
  icon: Settings,
  roles: ["admin", "oficina"],
  items: [
    { title: "Configurações", url: "/admin/configuracoes", icon: Settings, roles: ["admin", "oficina"] },
    { title: "Documentação", url: "/admin/documentacao", icon: FileText, roles: ["admin", "oficina"] },
  ],
};

// MODULE: Gestão (dashboards customizados)
const gestaoModule: AdminMenuGroup = {
  label: "Gestão",
  icon: LayoutDashboard,
  roles: ["admin"],
  items: [
    { title: "Meus Dashboards", url: "/gestao", icon: LayoutDashboard, roles: ["admin"] },
  ],
};

// All admin modules - easy to separate in the future
const adminModules: AdminMenuGroup[] = [
  operacionalModule,
  dashboardModule,
  gestaoModule,
  sistemaModule,
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

  // Filter modules based on user role
  const filteredModules = adminModules
    .filter(module => role && module.roles.includes(role))
    .map(module => ({
      ...module,
      items: module.items.filter(item => role && item.roles.includes(role))
    }))
    .filter(module => module.items.length > 0);

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
        {variant === "admin" ? (
          // ADMIN: Modular grouped layout by role
          <>
            {filteredModules.map((module) => (
              <Collapsible key={module.label} defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground flex items-center justify-between pr-2">
                      <div className="flex items-center gap-2">
                        <module.icon className="h-3.5 w-3.5" />
                        {!collapsed && <span>{module.label}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      )}
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {module.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(item.url)}
                              tooltip={collapsed ? item.title : undefined}
                            >
                              <NavLink
                                to={item.url}
                                end={item.url === "/admin"}
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
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))}
          </>
        ) : (
          // CLIENT: Simple flat layout
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                Menu
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {clientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
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
        )}
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
