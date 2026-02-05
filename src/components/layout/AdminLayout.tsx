import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UnifiedViewSwitcher } from "./UnifiedViewSwitcher";
import { Menu, Sun, Moon, ArrowLeft, LayoutDashboard, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useUserRole();
  const isGestor = role === "gestao" || role === "dev";

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleNavigateToView = (view: 'gestao' | 'admin' | 'cliente') => {
    switch (view) {
      case 'gestao':
        navigate('/gestao');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'cliente':
        navigate('/');
        break;
    }
  };

  const canGoBack = location.pathname !== '/admin' && location.pathname !== '/gestao' && location.pathname !== '/';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full gradient-bg">
        <AppSidebar isOpen={true} onToggle={() => {}} />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-4 border-b border-border/50 px-4 bg-background/50 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>

            {/* Botão Voltar */}
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}

            <div className="flex-1" />

            {/* View Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Trocar Visão
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Selecione a Visão</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigateToView('cliente')}>
                  <Users className="w-4 h-4 mr-2" />
                  Cliente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigateToView('admin')}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Admin
                </DropdownMenuItem>
                {isGestor && (
                  <DropdownMenuItem onClick={() => handleNavigateToView('gestao')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Gestão
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleTheme('light')}>
                  <Sun className="w-4 h-4 mr-2" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTheme('dark')}>
                  <Moon className="w-4 h-4 mr-2" />
                  Escuro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
