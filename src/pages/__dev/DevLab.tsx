import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map,
  Component,
  Info,
  Zap,
  Search,
  ExternalLink,
  Layout,
  Shield,
  Users,
  Settings,
  Home,
  Calendar,
  FileText,
  BarChart3,
  Wrench,
  Eye,
  Trash2,
  RotateCcw,
  Copy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Route Map Data ───
const allRoutes = [
  { path: "/", label: "Home (Cliente)", icon: Home, area: "cliente" },
  { path: "/login", label: "Login", icon: Shield, area: "auth" },
  { path: "/register", label: "Registro", icon: Shield, area: "auth" },
  { path: "/verify-otp", label: "Verificar OTP", icon: Shield, area: "auth" },
  { path: "/agenda", label: "Agenda", icon: Calendar, area: "cliente" },
  { path: "/profile", label: "Perfil", icon: Users, area: "cliente" },
  { path: "/avisos", label: "Avisos", icon: AlertCircle, area: "cliente" },
  { path: "/novo-agendamento", label: "Novo Agendamento", icon: Calendar, area: "cliente" },
  { path: "/agendamento-sucesso", label: "Agendamento Sucesso", icon: CheckCircle2, area: "cliente" },
  { path: "/historico", label: "Histórico", icon: FileText, area: "cliente" },
  { path: "/configuracoes", label: "Configurações", icon: Settings, area: "cliente" },
  { path: "/performance", label: "Performance", icon: BarChart3, area: "cliente" },
  { path: "/veiculo/:id", label: "Detalhes Veículo", icon: Wrench, area: "cliente" },
  { path: "/servico/:id", label: "Detalhes Serviço", icon: Wrench, area: "cliente" },
  { path: "/orcamento/:id", label: "Orçamento Cliente", icon: FileText, area: "cliente" },
  { path: "/reagendamento", label: "Reagendamento", icon: Calendar, area: "cliente" },
  { path: "/blog", label: "Blog", icon: FileText, area: "cliente" },
  { path: "/promocoes", label: "Promoções", icon: Zap, area: "cliente" },
  { path: "/os-ultimate", label: "OS Ultimate", icon: FileText, area: "cliente" },
  { path: "/demos", label: "Demo Index", icon: Eye, area: "dev" },
  { path: "/install", label: "Install PWA", icon: Package, area: "cliente" },
  { path: "/dashboard", label: "Dashboard Selector", icon: Layout, area: "cliente" },
  { path: "/cliente/dashboard", label: "Cliente Dashboard", icon: Layout, area: "cliente" },

  { path: "/admin", label: "Dashboard Admin", icon: Layout, area: "admin" },
  { path: "/admin/login", label: "Login Admin", icon: Shield, area: "auth" },
  { path: "/admin/patio", label: "Pátio", icon: Map, area: "admin" },
  { path: "/admin/clientes", label: "Clientes", icon: Users, area: "admin" },
  { path: "/admin/ordens-servico", label: "Ordens de Serviço", icon: FileText, area: "admin" },
  { path: "/admin/nova-os", label: "Nova OS", icon: FileText, area: "admin" },
  { path: "/admin/os/:osId", label: "Detalhes OS", icon: FileText, area: "admin" },
  { path: "/admin/servicos", label: "Serviços", icon: Wrench, area: "admin" },
  { path: "/admin/financeiro", label: "Financeiro", icon: BarChart3, area: "admin" },
  { path: "/admin/configuracoes", label: "Configurações", icon: Settings, area: "admin" },
  { path: "/admin/agenda-mecanicos", label: "Agenda Mecânicos", icon: Calendar, area: "admin" },
  { path: "/admin/agendamentos", label: "Agendamentos", icon: Calendar, area: "admin" },
  { path: "/admin/agendamentos-admin", label: "Agendamentos Admin", icon: Calendar, area: "admin" },
  { path: "/admin/documentacao", label: "Documentação", icon: FileText, area: "admin" },
  { path: "/admin/mechanic-analytics", label: "Mechanic Analytics", icon: BarChart3, area: "admin" },
  { path: "/admin/mechanic-feedback", label: "Mechanic Feedback", icon: Users, area: "admin" },
  { path: "/admin/operacional", label: "Operacional", icon: Wrench, area: "admin" },
  { path: "/admin/painel-tv", label: "Painel TV", icon: Eye, area: "admin" },
  { path: "/admin/patio/:patioId", label: "Pátio Detalhes", icon: Map, area: "admin" },
  { path: "/admin/produtividade", label: "Produtividade", icon: BarChart3, area: "admin" },

  { path: "/gestao", label: "Dashboards Gestão", icon: Layout, area: "gestao" },
  { path: "/gestao/agendamentos", label: "Agendamentos", icon: Calendar, area: "gestao" },
  { path: "/gestao/patio", label: "Pátio", icon: Map, area: "gestao" },
  { path: "/gestao/clientes", label: "Clientes", icon: Users, area: "gestao" },
  { path: "/gestao/ordens-servico", label: "Ordens de Serviço", icon: FileText, area: "gestao" },
  { path: "/gestao/nova-os", label: "Nova OS", icon: FileText, area: "gestao" },
  { path: "/gestao/os/:osId", label: "Detalhes OS", icon: FileText, area: "gestao" },
  { path: "/gestao/servicos", label: "Serviços", icon: Wrench, area: "gestao" },
  { path: "/gestao/financeiro", label: "Financeiro", icon: BarChart3, area: "gestao" },
  { path: "/gestao/configuracoes", label: "Configurações", icon: Settings, area: "gestao" },
  { path: "/gestao/comercial", label: "Comercial", icon: BarChart3, area: "gestao" },
  { path: "/gestao/melhorias", label: "Melhorias", icon: Zap, area: "gestao" },
  { path: "/gestao/operacoes", label: "Operações", icon: Wrench, area: "gestao" },
  { path: "/gestao/rh", label: "RH", icon: Users, area: "gestao" },
  { path: "/gestao/tecnologia", label: "Tecnologia", icon: Settings, area: "gestao" },
  { path: "/gestao/usuarios", label: "Usuários", icon: Users, area: "gestao" },
  { path: "/gestao/ia-configuracoes", label: "IA Configurações", icon: Settings, area: "gestao" },
  { path: "/gestao/migracao-trello", label: "Migração Trello", icon: Package, area: "gestao" },

  { path: "/__dev", label: "Dev Dashboard", icon: Layout, area: "dev" },
  { path: "/__dev/database", label: "Dev Database", icon: Package, area: "dev" },
  { path: "/__dev/system", label: "Dev System", icon: Info, area: "dev" },
  { path: "/__dev/lab", label: "DevLab", icon: Component, area: "dev" },
];

const areaConfig: Record<string, { label: string; color: string; bg: string }> = {
  cliente: { label: "Cliente", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  admin: { label: "Admin", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  gestao: { label: "Gestão", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  auth: { label: "Auth", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  dev: { label: "Dev", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

// ─── Component ───

export default function DevLab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredRoutes = allRoutes.filter((r) => {
    const matchesSearch =
      r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = !selectedArea || r.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const routeCounts = allRoutes.reduce(
    (acc, r) => {
      acc[r.area] = (acc[r.area] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success(`Copiado: ${path}`);
  };

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("LocalStorage e SessionStorage limpos!");
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-xl bg-primary/10">
                <Component className="w-7 h-7 text-primary" />
              </span>
              DevLab
            </h1>
            <p className="text-muted-foreground mt-1">
              Hub de desenvolvimento • {allRoutes.length} rotas • Visualização e ações rápidas
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            DEV
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="routes" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="routes" className="gap-2">
              <Map className="w-4 h-4" /> Rotas
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2">
              <Component className="w-4 h-4" /> Componentes
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Info className="w-4 h-4" /> Sistema
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Zap className="w-4 h-4" /> Ações
            </TabsTrigger>
          </TabsList>

          {/* ═══ ROUTES TAB ═══ */}
          <TabsContent value="routes" className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rota ou label..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedArea === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedArea(null)}
                >
                  Todas ({allRoutes.length})
                </Button>
                {Object.entries(areaConfig).map(([key, cfg]) => (
                  <Button
                    key={key}
                    variant={selectedArea === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedArea(selectedArea === key ? null : key)}
                  >
                    {cfg.label} ({routeCounts[key] || 0})
                  </Button>
                ))}
              </div>
            </div>

            {/* Route List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredRoutes.map((route) => {
                const Icon = route.icon;
                const area = areaConfig[route.area];
                const isNavigable = !route.path.includes(":");
                return (
                  <div
                    key={route.path}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${area.bg} group hover:ring-1 hover:ring-primary/30 transition-all`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${area.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{route.label}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{route.path}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyPath(route.path)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {isNavigable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => navigate(route.path)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredRoutes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma rota encontrada.</p>
            )}
          </TabsContent>

          {/* ═══ COMPONENTS TAB ═══ */}
          <TabsContent value="components" className="space-y-6">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Botões</CardTitle>
                <CardDescription>Variantes do componente Button</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Zap className="w-4 h-4" /></Button>
                <Button disabled>Disabled</Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Badges</CardTitle>
                <CardDescription>Variantes do componente Badge</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cards</CardTitle>
                <CardDescription>Variações de card com glass effect</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Card Padrão</CardTitle>
                    <CardDescription>Com header e description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Conteúdo do card.</p>
                  </CardContent>
                </Card>
                <div className="glass-card p-4 space-y-2">
                  <p className="font-semibold">Glass Card</p>
                  <p className="text-sm text-muted-foreground">Com efeito glass do design system.</p>
                </div>
                <div className="glass-card animated-border p-4 space-y-2">
                  <p className="font-semibold">Animated Border</p>
                  <p className="text-sm text-muted-foreground">Card com borda animada.</p>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paleta de Cores</CardTitle>
                <CardDescription>Tokens do design system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {[
                    { name: "Primary", className: "bg-primary" },
                    { name: "Secondary", className: "bg-secondary" },
                    { name: "Accent", className: "bg-accent" },
                    { name: "Muted", className: "bg-muted" },
                    { name: "Destructive", className: "bg-destructive" },
                    { name: "Background", className: "bg-background border" },
                    { name: "Card", className: "bg-card border" },
                    { name: "Success", className: "bg-[hsl(var(--success))]" },
                    { name: "Warning", className: "bg-[hsl(var(--warning))]" },
                    { name: "Violet", className: "bg-[hsl(var(--violet))]" },
                    { name: "Brand Deep", className: "bg-[hsl(var(--brand-deep))]" },
                    { name: "Brand Light", className: "bg-[hsl(var(--brand-light))]" },
                  ].map((c) => (
                    <div key={c.name} className="space-y-1.5">
                      <div className={`h-10 rounded-lg ${c.className}`} />
                      <p className="text-xs text-muted-foreground text-center">{c.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ SYSTEM TAB ═══ */}
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total de Rotas", value: allRoutes.length, icon: Map },
                { label: "Áreas", value: Object.keys(areaConfig).length, icon: Layout },
                { label: "Rotas Cliente", value: routeCounts.cliente || 0, icon: Users },
                { label: "Rotas Admin", value: routeCounts.admin || 0, icon: Shield },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Ambiente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { k: "Framework", v: "React 18 + Vite" },
                  { k: "Estilização", v: "Tailwind CSS + shadcn/ui" },
                  { k: "Backend", v: "Lovable Cloud" },
                  { k: "Linguagem", v: "TypeScript" },
                  { k: "User Agent", v: navigator.userAgent.slice(0, 80) + "..." },
                  { k: "Viewport", v: `${window.innerWidth}×${window.innerHeight}` },
                  { k: "Rotas Gestão", v: String(routeCounts.gestao || 0) },
                  { k: "Rotas Dev", v: String(routeCounts.dev || 0) },
                ].map((item) => (
                  <div key={item.k} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.k}</span>
                    <span className="text-sm font-mono">{item.v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rotas por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(areaConfig).map(([key, cfg]) => {
                    const count = routeCounts[key] || 0;
                    const pct = Math.round((count / allRoutes.length) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={cfg.color}>{cfg.label}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ACTIONS TAB ═══ */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Limpeza</CardTitle>
                  <CardDescription>Limpar caches e estados locais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleClearStorage}>
                    <Trash2 className="w-4 h-4" /> Limpar Storage (local + session)
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleReload}>
                    <RotateCcw className="w-4 h-4" /> Recarregar Página
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navegação Rápida</CardTitle>
                  <CardDescription>Ir direto para áreas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Home Cliente", path: "/" },
                    { label: "Admin Dashboard", path: "/admin" },
                    { label: "Gestão", path: "/gestao" },
                    { label: "Dev Dashboard", path: "/__dev" },
                  ].map((link) => (
                    <Button
                      key={link.path}
                      variant="outline"
                      className="w-full justify-between"
                      asChild
                    >
                      <Link to={link.path}>
                        {link.label}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Utilitários</CardTitle>
                  <CardDescription>Ferramentas de desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      console.log("=== APP STATE DEBUG ===");
                      console.log("Routes:", allRoutes.length);
                      console.log("LocalStorage keys:", Object.keys(localStorage));
                      console.log("URL:", window.location.href);
                      toast.success("State logado no console (F12)");
                    }}
                  >
                    <Info className="w-4 h-4" /> Log App State no Console
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      const data = JSON.stringify(allRoutes, null, 2);
                      navigator.clipboard.writeText(data);
                      toast.success("Mapa de rotas copiado como JSON!");
                    }}
                  >
                    <Copy className="w-4 h-4" /> Copiar Mapa de Rotas (JSON)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Links Externos</CardTitle>
                  <CardDescription>Recursos e documentação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" /> shadcn/ui Docs
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" /> Tailwind CSS Docs
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" /> Lucide Icons
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
