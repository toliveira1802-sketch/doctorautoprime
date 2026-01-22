/* QG das IAs - Central de Comando e Controle */
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { 
  Crown, 
  DollarSign, 
  AlertCircle, 
  Activity,
  Target,
  MessageSquare,
  TrendingUp,
  Eye,
  Settings,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  BarChart3,
  Shield,
  Rocket
} from "lucide-react";

interface IA {
  id: string;
  nome: string;
  funcao: string;
  emoji: string;
  icon: any;
  ativa: boolean;
  ultimaAcao: string;
  prioridade: "maxima" | "alta" | "media";
  logs?: Array<{acao: string, timestamp: string}>;
  status?: "online" | "offline" | "standby";
  performance?: number; // 0-100
}

export default function QGDasIAs() {
  const [logs, setLogs] = useState<Array<{acao: string, timestamp: string}>>([]);
  const [expandedIA, setExpandedIA] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const savedLogs = localStorage.getItem("qg-logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const adicionarLog = (acao: string) => {
    const novoLog = {
      acao,
      timestamp: new Date().toLocaleString('pt-BR')
    };
    const novosLogs = [novoLog, ...logs].slice(0, 20);
    setLogs(novosLogs);
    localStorage.setItem("qg-logs", JSON.stringify(novosLogs));
  };

  const [ias, setIas] = useState<IA[]>([
    {
      id: "bia",
      nome: "BIA",
      funcao: "Líder Desenvolvedora",
      emoji: "👑",
      icon: Crown,
      ativa: true,
      ultimaAcao: "há 2 minutos",
      prioridade: "maxima",
      status: "online",
      performance: 98
    },
    {
      id: "anna-laura",
      nome: "ANNA LAURA",
      funcao: "Especialista em Vendas++",
      emoji: "💰",
      icon: DollarSign,
      ativa: true,
      ultimaAcao: "há 5 minutos",
      prioridade: "maxima",
      status: "online",
      performance: 95
    },
    {
      id: "vigilante",
      nome: "VIGILANTE",
      funcao: "Monitor de Leads",
      emoji: "🚨",
      icon: AlertCircle,
      ativa: true,
      ultimaAcao: "há 1 minuto",
      prioridade: "maxima",
      status: "online",
      performance: 100
    },
    {
      id: "reativador",
      nome: "REATIVADOR",
      funcao: "Reativação de Leads",
      emoji: "🔄",
      icon: Activity,
      ativa: true,
      ultimaAcao: "há 10 minutos",
      prioridade: "maxima",
      status: "online",
      performance: 92
    },
    {
      id: "marketeiro",
      nome: "MARKETEIRO",
      funcao: "Marketing e Conteúdo",
      emoji: "📱",
      icon: MessageSquare,
      ativa: true,
      ultimaAcao: "há 30 minutos",
      prioridade: "maxima",
      status: "online",
      performance: 88
    },
    {
      id: "competidor",
      nome: "COMPETIDOR",
      funcao: "Análise de Concorrência",
      emoji: "🔍",
      icon: Eye,
      ativa: false,
      ultimaAcao: "há 2 horas",
      prioridade: "maxima",
      status: "standby",
      performance: 75
    },
    {
      id: "analista",
      nome: "ANALISTA DE DADOS",
      funcao: "Análise de Leads",
      emoji: "📊",
      icon: TrendingUp,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "alta",
      status: "offline",
      performance: 0
    },
    {
      id: "qualificador",
      nome: "QUALIFICADOR",
      funcao: "Classificação de Leads",
      emoji: "🎯",
      icon: Target,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "alta",
      status: "offline",
      performance: 0
    },
    {
      id: "fiscal",
      nome: "FISCAL DO CRM",
      funcao: "Qualidade de Dados",
      emoji: "📝",
      icon: CheckCircle2,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "alta",
      status: "offline",
      performance: 0
    },
    {
      id: "patio",
      nome: "ORGANIZADOR DE PÁTIO",
      funcao: "Controle de Pátio",
      emoji: "🏗️",
      icon: Target,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "alta",
      status: "offline",
      performance: 0
    },
    {
      id: "iscas",
      nome: "ESTRATEGISTA DE ISCAS",
      funcao: "Monitor de Conversão",
      emoji: "📈",
      icon: TrendingUp,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "alta",
      status: "offline",
      performance: 0
    },
    {
      id: "dedo-duro",
      nome: "DEDO DURO",
      funcao: "Detector de Inconsistências",
      emoji: "🕵️",
      icon: Eye,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "media",
      status: "offline",
      performance: 0
    },
    {
      id: "analista-preco",
      nome: "ANALISTA DE PREÇO",
      funcao: "Monitor de Mercado",
      emoji: "💵",
      icon: DollarSign,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "media",
      status: "offline",
      performance: 0
    },
    {
      id: "analista-tecnico",
      nome: "ANALISTA TÉCNICO",
      funcao: "Especialista em Diagnóstico",
      emoji: "🔧",
      icon: Settings,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "media",
      status: "offline",
      performance: 0
    },
    {
      id: "casanova",
      nome: "CASANOVA",
      funcao: "Recompensa de Meta (Tinder)",
      emoji: "💘",
      icon: MessageSquare,
      ativa: false,
      ultimaAcao: "nunca",
      prioridade: "media",
      status: "offline",
      performance: 0
    }
  ]);

  const adicionarLogIA = (iaId: string, acao: string) => {
    setIas(prev => prev.map(ia => {
      if (ia.id === iaId) {
        const novoLog = {
          acao,
          timestamp: new Date().toLocaleString('pt-BR')
        };
        const logsAtualizados = [novoLog, ...(ia.logs || [])].slice(0, 5);
        return { ...ia, logs: logsAtualizados };
      }
      return ia;
    }));
  };

  const toggleIA = (id: string) => {
    const ia = ias.find(i => i.id === id);
    if (ia) {
      const acao = ia.ativa ? `🔴 Desativou ${ia.nome}` : `🟢 Ativou ${ia.nome}`;
      adicionarLog(acao);
      
      const acaoIA = ia.ativa ? "Desativada pelo operador" : "Ativada pelo operador";
      adicionarLogIA(id, acaoIA);
      
      setIas(prev => prev.map(ia => 
        ia.id === id ? { 
          ...ia, 
          ativa: !ia.ativa,
          status: !ia.ativa ? "online" : "offline"
        } : ia
      ));
    }
  };

  const executarIA = (id: string) => {
    const ia = ias.find(i => i.id === id);
    if (ia) {
      adicionarLog(`⚡ Executou ${ia.nome}`);
      adicionarLogIA(id, "Executada manualmente");
      
      // Simula execução
      setIas(prev => prev.map(ia => 
        ia.id === id ? { 
          ...ia, 
          ultimaAcao: "agora",
          performance: Math.min(100, (ia.performance || 0) + 5)
        } : ia
      ));
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch(prioridade) {
      case "maxima": return "text-destructive";
      case "alta": return "text-primary";
      case "media": return "text-accent";
      default: return "text-muted-foreground";
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch(prioridade) {
      case "maxima": return "bg-destructive/20 text-destructive border-destructive";
      case "alta": return "bg-primary/20 text-primary border-primary";
      case "media": return "bg-accent/20 text-accent border-accent";
      default: return "";
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case "online": return "bg-accent";
      case "standby": return "bg-primary";
      case "offline": return "bg-muted-foreground";
      default: return "bg-muted-foreground";
    }
  };

  const getPerformanceColor = (performance?: number) => {
    if (!performance) return "text-muted-foreground";
    if (performance >= 90) return "text-accent";
    if (performance >= 70) return "text-primary";
    return "text-destructive";
  };

  const ativasCount = ias.filter(ia => ia.ativa).length;
  const inativasCount = ias.length - ativasCount;
  const performanceMedia = Math.round(
    ias.reduce((acc, ia) => acc + (ia.performance || 0), 0) / ias.length
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-card border-b-2 border-primary/30 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            color: 'var(--primary)'
          }}
        />
        <div className="container py-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <Badge variant="outline" className="border-primary text-primary font-mono text-xs">
                  QG OPERACIONAL
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-2 tracking-wider">
                🎯 QG DAS IAs
              </h1>
              <p className="text-sm font-mono text-muted-foreground">
                Central de Comando e Controle // Exército de IAs
              </p>
            </div>
            
            <Link href="/">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                ← Voltar ao Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-xs font-mono text-muted-foreground">Ativas</div>
                  <div className="text-2xl font-display font-bold text-accent">{ativasCount}</div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-xs font-mono text-muted-foreground">Inativas</div>
                  <div className="text-2xl font-display font-bold text-muted-foreground">{inativasCount}</div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-xs font-mono text-muted-foreground">Performance</div>
                  <div className="text-2xl font-display font-bold text-primary">{performanceMedia}%</div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-xs font-mono text-muted-foreground">Total</div>
                  <div className="text-2xl font-display font-bold text-foreground">{ias.length}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={() => {
              adicionarLog("🟢 Ativou TODAS as IAs");
              setIas(prev => prev.map(ia => ({ ...ia, ativa: true, status: "online" })));
            }}
            className="bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Ativar Todas
          </Button>
          
          <Button 
            onClick={() => {
              adicionarLog("🔴 Desativou TODAS as IAs");
              setIas(prev => prev.map(ia => ({ ...ia, ativa: false, status: "offline" })));
            }}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Desativar Todas
          </Button>

          <Button 
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            variant="outline"
          >
            {viewMode === "grid" ? "📋 Modo Lista" : "🎯 Modo Grid"}
          </Button>

          <Link href="/controle">
            <Button variant="outline" className="w-full">
              ⚙️ Painel Avançado
            </Button>
          </Link>
        </div>

        {/* IAs Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {ias.map((ia) => {
            const Icon = ia.icon;
            const isExpanded = expandedIA === ia.id;
            
            return (
              <Card 
                key={ia.id}
                className={`bg-card border-2 transition-all ${
                  ia.ativa 
                    ? "border-primary/30 hover:border-primary/50" 
                    : "border-border opacity-70"
                }`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 flex items-center justify-center border-2 ${
                      ia.ativa 
                        ? "bg-primary/20 border-primary" 
                        : "bg-secondary border-border"
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        ia.ativa ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-lg text-foreground truncate">
                          {ia.emoji} {ia.nome}
                        </h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(ia.status)} animate-pulse`} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mb-2">{ia.funcao}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${getPrioridadeBadge(ia.prioridade)}`}>
                          {ia.prioridade}
                        </Badge>
                        <span className={`text-xs font-mono ${getPerformanceColor(ia.performance)}`}>
                          {ia.performance}% ⚡
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          (ia.performance || 0) >= 90 ? "bg-accent" :
                          (ia.performance || 0) >= 70 ? "bg-primary" : "bg-destructive"
                        }`}
                        style={{ width: `${ia.performance || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mb-3">
                    <Switch 
                      checked={ia.ativa}
                      onCheckedChange={() => toggleIA(ia.id)}
                    />
                    <span className="text-sm font-mono text-muted-foreground flex-1">
                      {ia.ativa ? "Online" : "Offline"}
                    </span>
                    
                    <Button
                      size="sm"
                      onClick={() => executarIA(ia.id)}
                      disabled={!ia.ativa}
                      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedIA(isExpanded ? null : ia.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Última Ação */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Última ação: {ia.ultimaAcao}</span>
                  </div>

                  {/* Expanded Logs */}
                  {isExpanded && ia.logs && ia.logs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-xs font-mono text-muted-foreground mb-2">LOGS RECENTES:</h4>
                      <div className="space-y-1">
                        {ia.logs.map((log, idx) => (
                          <div key={idx} className="text-xs font-mono text-muted-foreground">
                            <span className="text-primary">[{log.timestamp}]</span> {log.acao}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link para perfil */}
                  <Link href={`/ia/${ia.id}`}>
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                      Ver Perfil Completo →
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Logs Section */}
        <Card className="mt-8 bg-card border-border">
          <div className="p-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              LOG DE OPERAÇÕES
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono">Nenhuma operação registrada ainda.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-sm font-mono text-muted-foreground border-l-2 border-primary pl-3 py-1">
                    <span className="text-primary">[{log.timestamp}]</span> {log.acao}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
