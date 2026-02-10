import { useState, useMemo, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  RefreshCw,
  Maximize2,
  ExternalLink,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Types ───
interface RouteEntry {
  path: string;
  label: string;
  active: boolean; // registered in router
}

interface RouteCategory {
  emoji: string;
  label: string;
  color: string;
  activeBg: string;
  routes: RouteEntry[];
}

// ─── Route Data ───
// Active routes = registered in App.tsx router
// Orphan routes = pages that exist but aren't in the router

const routeCategories: RouteCategory[] = [
  {
    emoji: "🔴",
    label: "Públicas",
    color: "text-red-400",
    activeBg: "bg-red-500/10",
    routes: [
      { path: "/login", label: "Login", active: true },
      { path: "/register", label: "Registro", active: true },
      { path: "/verify-otp", label: "Verificar OTP", active: true },
      { path: "/admin/login", label: "Login Admin", active: true },
      { path: "/orcamento/:id", label: "Orçamento Cliente", active: true },
      { path: "/blog", label: "Blog", active: true },
      { path: "/promocoes", label: "Promoções", active: true },
      { path: "/install", label: "Instalar PWA", active: true },
      { path: "/dashboard", label: "Dashboard Selector", active: true },
    ],
  },
  {
    emoji: "🚗",
    label: "Cliente",
    color: "text-blue-400",
    activeBg: "bg-blue-500/10",
    routes: [
      { path: "/", label: "Home", active: true },
      { path: "/agenda", label: "Agenda", active: true },
      { path: "/profile", label: "Perfil", active: true },
      { path: "/avisos", label: "Avisos", active: true },
      { path: "/novo-agendamento", label: "Novo Agendamento", active: true },
      { path: "/agendamento-sucesso", label: "Agendamento Sucesso", active: true },
      { path: "/historico", label: "Histórico", active: true },
      { path: "/configuracoes", label: "Configurações", active: true },
      { path: "/performance", label: "Performance", active: true },
      { path: "/veiculo/:id", label: "Detalhes Veículo", active: true },
      { path: "/servico/:id", label: "Detalhes Serviço", active: true },
      { path: "/reagendamento", label: "Reagendamento", active: true },
      { path: "/os-ultimate", label: "OS Ultimate", active: true },
      { path: "/biometric-setup", label: "Biometric Setup", active: true },
      { path: "/cliente/dashboard", label: "Cliente Dashboard", active: true },
    ],
  },
  {
    emoji: "🏢",
    label: "Admin",
    color: "text-amber-400",
    activeBg: "bg-amber-500/10",
    routes: [
      { path: "/admin", label: "Dashboard", active: true },
      { path: "/admin/agendamentos", label: "Agendamentos", active: true },
      { path: "/admin/patio", label: "Pátio", active: true },
      { path: "/admin/clientes", label: "Clientes", active: true },
      { path: "/admin/ordens-servico", label: "Ordens de Serviço", active: true },
      { path: "/admin/nova-os", label: "Nova OS", active: true },
      { path: "/admin/os/:osId", label: "OS Detalhes", active: true },
      { path: "/admin/servicos", label: "Serviços", active: true },
      { path: "/admin/financeiro", label: "Financeiro", active: true },
      { path: "/admin/configuracoes", label: "Configurações", active: true },
      { path: "/admin/agenda-mecanicos", label: "Agenda Mecânicos", active: true },
      { path: "/admin/agendamentos-admin", label: "Agendamentos Admin", active: true },
      { path: "/admin/documentacao", label: "Documentação", active: true },
      { path: "/admin/mechanic-analytics", label: "Mechanic Analytics", active: true },
      { path: "/admin/mechanic-feedback", label: "Mechanic Feedback", active: true },
      { path: "/admin/operacional", label: "Operacional", active: true },
      { path: "/admin/painel-tv", label: "Painel TV", active: true },
      { path: "/admin/patio/:patioId", label: "Pátio Detalhes", active: true },
      { path: "/admin/produtividade", label: "Produtividade", active: true },
      // Orphan pages (exist but not in router)
      { path: "/admin/dashboard-overview", label: "Dashboard Overview", active: false },
    ],
  },
  {
    emoji: "📋",
    label: "Gestão",
    color: "text-emerald-400",
    activeBg: "bg-emerald-500/10",
    routes: [
      { path: "/gestao", label: "Hub Dashboards", active: true },
      { path: "/gestao/agendamentos", label: "Agendamentos", active: true },
      { path: "/gestao/patio", label: "Pátio", active: true },
      { path: "/gestao/clientes", label: "Clientes", active: true },
      { path: "/gestao/ordens-servico", label: "Ordens de Serviço", active: true },
      { path: "/gestao/nova-os", label: "Nova OS", active: true },
      { path: "/gestao/os/:osId", label: "OS Detalhes", active: true },
      { path: "/gestao/servicos", label: "Serviços", active: true },
      { path: "/gestao/financeiro", label: "Financeiro", active: true },
      { path: "/gestao/configuracoes", label: "Configurações", active: true },
      { path: "/gestao/comercial", label: "Comercial", active: true },
      { path: "/gestao/melhorias", label: "Melhorias", active: true },
      { path: "/gestao/operacoes", label: "Operações", active: true },
      { path: "/gestao/rh", label: "RH", active: true },
      { path: "/gestao/tecnologia", label: "Tecnologia", active: true },
      { path: "/gestao/usuarios", label: "Usuários", active: true },
      { path: "/gestao/ia-configuracoes", label: "IA Configurações", active: true },
      { path: "/gestao/migracao-trello", label: "Migração Trello", active: true },
      // Orphan pages
      { path: "/gestao/dashboard-view", label: "Dashboard View", active: false },
    ],
  },
  {
    emoji: "⚙️",
    label: "Sistema",
    color: "text-violet-400",
    activeBg: "bg-violet-500/10",
    routes: [
      { path: "/__dev", label: "Dev Dashboard", active: true },
      { path: "/__dev/database", label: "Dev Database", active: true },
      { path: "/__dev/system", label: "Dev System", active: true },
      { path: "/__dev/lab", label: "DevLab (aqui)", active: true },
      { path: "/demos", label: "Demo Index", active: true },
      { path: "/pagina-teste", label: "Página Teste", active: true },
      { path: "/teste-simples", label: "Teste Simples", active: true },
      { path: "/teste-expandido", label: "Teste Expandido", active: true },
      { path: "*", label: "404 Not Found", active: true },
    ],
  },
];

// ─── Viewport presets ───
const viewports = [
  { key: "desktop" as const, icon: Monitor, width: "100%", label: "Desktop" },
  { key: "tablet" as const, icon: Tablet, width: "768px", label: "Tablet" },
  { key: "mobile" as const, icon: Smartphone, width: "375px", label: "Mobile" },
];

// ─── Component ───
export default function DevLab() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteEntry | null>(null);
  const [showOrphans, setShowOrphans] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [darkPreview, setDarkPreview] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ─── Computed ───
  const allRoutes = useMemo(
    () => routeCategories.flatMap((c) => c.routes),
    []
  );

  const activeCount = useMemo(() => allRoutes.filter((r) => r.active).length, [allRoutes]);
  const orphanCount = useMemo(() => allRoutes.filter((r) => !r.active).length, [allRoutes]);
  const totalCount = allRoutes.length;

  const flatFiltered = useMemo(() => {
    return allRoutes.filter((r) => (showOrphans ? true : r.active));
  }, [allRoutes, showOrphans]);

  const currentIndex = selectedRoute
    ? flatFiltered.findIndex((r) => r.path === selectedRoute.path)
    : -1;

  // ─── Handlers ───
  const handleSelectRoute = useCallback((route: RouteEntry) => {
    setSelectedRoute(route);
    setIframeKey((k) => k + 1);
  }, []);

  const handleNavigate = useCallback(
    (dir: -1 | 1) => {
      if (flatFiltered.length === 0) return;
      const next =
        currentIndex === -1
          ? 0
          : (currentIndex + dir + flatFiltered.length) % flatFiltered.length;
      handleSelectRoute(flatFiltered[next]);
    },
    [currentIndex, flatFiltered, handleSelectRoute]
  );

  const toggleCategory = (label: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getPreviewUrl = () => {
    if (!selectedRoute) return "";
    const path = selectedRoute.path.replace(/:[\w]+/g, "demo");
    return `${path}${path.includes("?") ? "&" : "?"}dev=true`;
  };

  const currentViewport = viewports.find((v) => v.key === viewport)!;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground">
      {/* ═══ SIDEBAR ═══ */}
      {sidebarOpen && (
        <aside className="w-80 min-w-[320px] border-r border-border flex flex-col bg-card">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Telas</h2>
                <Badge variant="outline" className="ml-1 text-xs font-mono">
                  {totalCount}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                {activeCount} ativas
              </span>
              <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 font-medium">
                {orphanCount} órfãs
              </span>
            </div>

            {/* Toggle orphans */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs h-8"
              onClick={() => setShowOrphans(!showOrphans)}
            >
              {showOrphans ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              {showOrphans ? 'Mostrar "órfãs"' : 'Ocultar "órfãs"'}
            </Button>
          </div>

          {/* Route List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {routeCategories.map((cat) => {
                const visibleRoutes = cat.routes.filter((r) =>
                  showOrphans ? true : r.active
                );
                if (visibleRoutes.length === 0) return null;
                const isCollapsed = collapsedCategories[cat.label];

                return (
                  <div key={cat.label}>
                    {/* Category Header */}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCategory(cat.label)}
                    >
                      <span className="text-sm">{cat.emoji}</span>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${cat.color}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({visibleRoutes.length})
                      </span>
                      <span className="ml-auto">
                        {isCollapsed ? (
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ChevronUp className="w-3 h-3 text-muted-foreground" />
                        )}
                      </span>
                    </button>

                    {/* Routes */}
                    {!isCollapsed &&
                      visibleRoutes.map((route) => {
                        const isSelected = selectedRoute?.path === route.path;
                        const isOrphan = !route.active;
                        return (
                          <button
                            key={route.path}
                            className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ml-2 ${
                              isSelected
                                ? "bg-primary/15 text-primary font-medium"
                                : "hover:bg-muted/50 text-foreground/80"
                            } ${isOrphan ? "opacity-60 italic" : ""}`}
                            onClick={() => handleSelectRoute(route)}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isOrphan ? "bg-red-500" : "bg-emerald-500"
                              }`}
                            />
                            <span className="truncate flex-1">{route.label}</span>
                            {isOrphan && (
                              <span className="text-[10px] text-red-400 shrink-0">órfã</span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <code className="bg-muted px-1 rounded text-[10px]">?dev=true</code> para bypass
              auth
            </p>
          </div>
        </aside>
      )}

      {/* ═══ MAIN AREA ═══ */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-border flex items-center px-3 gap-2 bg-card shrink-0">
          {/* Collapse toggle */}
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* Navigation arrows */}
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleNavigate(-1)}
                    disabled={flatFiltered.length === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anterior</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleNavigate(1)}
                    disabled={flatFiltered.length === 0}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Próxima</TooltipContent>
              </Tooltip>
            </div>

            {/* Counter */}
            <span className="text-xs text-muted-foreground font-mono mx-1">
              {currentIndex >= 0 ? `${currentIndex + 1}/${flatFiltered.length}` : `—/${flatFiltered.length}`}
            </span>

            {/* Selected route path */}
            {selectedRoute && (
              <span className="text-xs font-mono text-primary truncate max-w-[200px]">
                {selectedRoute.path}
              </span>
            )}

            <div className="flex-1" />

            {/* Viewport toggles */}
            {viewports.map((vp) => (
              <Tooltip key={vp.key}>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewport === vp.key ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewport(vp.key)}
                  >
                    <vp.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{vp.label}</TooltipContent>
              </Tooltip>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDarkPreview(!darkPreview)}
                >
                  {darkPreview ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{darkPreview ? "Tema claro" : "Tema escuro"}</TooltipContent>
            </Tooltip>

            {/* Refresh */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIframeKey((k) => k + 1)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recarregar</TooltipContent>
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => iframeRef.current?.requestFullscreen?.()}
                  disabled={!selectedRoute}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>

            {/* Open in new tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (selectedRoute) window.open(getPreviewUrl(), "_blank");
                  }}
                  disabled={!selectedRoute}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abrir em nova aba</TooltipContent>
            </Tooltip>

            {/* Close preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedRoute(null)}
                  disabled={!selectedRoute}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fechar preview</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden p-4">
          {selectedRoute ? (
            <div
              className="h-full rounded-lg overflow-hidden border border-border shadow-xl transition-all duration-300 bg-background"
              style={{
                width: currentViewport.width,
                maxWidth: "100%",
              }}
            >
              <iframe
                ref={iframeRef}
                key={iframeKey}
                src={getPreviewUrl()}
                className="w-full h-full border-0"
                title={`Preview: ${selectedRoute.label}`}
              />
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md">
              <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                <Monitor className="w-16 h-16 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  DevLab — Doctor Auto Prime
                </h2>
                <p className="text-muted-foreground">
                  Selecione uma tela na sidebar para visualizar e testar interações.
                </p>
              </div>
              {/* Metrics */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 min-w-[80px]">
                  <span className="text-2xl font-bold text-emerald-400">{activeCount}</span>
                  <span className="text-[11px] text-emerald-400/80">Ativas</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20 min-w-[80px]">
                  <span className="text-2xl font-bold text-red-400">{orphanCount}</span>
                  <span className="text-[11px] text-red-400/80">Órfãs</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted border border-border min-w-[80px]">
                  <span className="text-2xl font-bold text-foreground">{totalCount}</span>
                  <span className="text-[11px] text-muted-foreground">Total</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
