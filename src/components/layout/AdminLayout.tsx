import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full gradient-bg dark">
        <AppSidebar variant="admin" />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-4 border-b border-border/50 px-4 bg-background/50 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Painel Gestão</h1>
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
