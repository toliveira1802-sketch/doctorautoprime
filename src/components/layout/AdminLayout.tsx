import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { Menu, Sun, Moon, ArrowLeft, LayoutDashboard, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
        <AppSidebar variant="admin" />
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


            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Painel Admin</h1>
            </div>

            {/* Profile Switcher */}
            <ProfileSwitcher />


            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTheme('dark')}
                className="h-9 w-9 p-0"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTheme('light')}
                className="h-9 w-9 p-0"
              >
                <Sun className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
