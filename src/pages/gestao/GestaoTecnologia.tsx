import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExportButtons } from "@/components/gestao/ExportButtons";
import { CustomizableDashboard } from "@/components/gestao/CustomizableDashboard";
import { exportToPDF, exportToExcel, type ReportData } from "@/utils/exportReport";
import { Laptop, Users, Database, Activity, Loader2, Clock, Brain, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function GestaoTecnologia() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalVehicles: 0,
    totalAppointments: 0,
  });
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Buscar total de perfis
      const { count: profileCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Buscar veículos
      const { count: vehicleCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Buscar total de agendamentos 
      const { count: appointmentCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      // Buscar eventos do funil (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: funnelEvents } = await supabase
        .from("funnel_events")
        .select("event_type")
        .gte("created_at", thirtyDaysAgo.toISOString());

      setKpis({
        totalUsers: profileCount || 0,
        activeToday: Math.floor((profileCount || 0) * 0.15), // Estimativa
        totalVehicles: vehicleCount || 0,
        totalAppointments: appointmentCount || 0,
      });

      // Agrupar eventos do funil
      if (funnelEvents) {
        const eventMap: Record<string, number> = {};
        funnelEvents.forEach(e => {
          eventMap[e.event_type] = (eventMap[e.event_type] || 0) + 1;
        });

        const eventLabels: Record<string, string> = {
          flow_started: "Iniciou Fluxo",
          vehicle_selected: "Selecionou Veículo",
          type_selected: "Selecionou Tipo",
          services_selected: "Selecionou Serviços",
          date_selected: "Selecionou Data",
          flow_completed: "Concluiu Fluxo",
          flow_abandoned: "Abandonou Fluxo",
        };

        setFunnelData(
          Object.entries(eventMap).map(([event, count]) => ({
            name: eventLabels[event] || event,
            value: count,
          }))
        );
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }

  function getReportData(): ReportData {
    return {
      title: "Relatório de Tecnologia",
      subtitle: "Doctor Auto Prime",
      kpis: [
        { label: "Total de Usuários", value: kpis.totalUsers },
        { label: "Usuários Ativos (Estimativa)", value: kpis.activeToday },
        { label: "Veículos Cadastrados", value: kpis.totalVehicles },
        { label: "Total de Agendamentos", value: kpis.totalAppointments },
      ],
      tables: [
        {
          title: "Eventos do Funil (30 dias)",
          headers: ["Evento", "Quantidade"],
          rows: funnelData.map(f => [f.name, f.value]),
        },
      ],
    };
  }

  const statCards = [
    { label: "Total Usuários", value: kpis.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Veículos Cadastrados", value: kpis.totalVehicles, icon: Database, color: "text-green-500" },
    { label: "Total Agendamentos", value: kpis.totalAppointments, icon: Clock, color: "text-purple-500" },
    { label: "Uptime Sistema", value: "99.9%", icon: Activity, color: "text-emerald-500" },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <CustomizableDashboard dashboardKey="tecnologia" title="Tecnologia">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Laptop className="w-6 h-6 text-purple-500" />
                Tecnologia
              </h1>
              <p className="text-muted-foreground mt-1">
                Métricas de uso e performance do sistema
              </p>
            </div>
            <ExportButtons
              onExportPDF={() => exportToPDF(getReportData())}
              onExportExcel={() => exportToExcel(getReportData())}
              isLoading={isLoading}
            />
          </div>

          {/* QG das IAs - AI Headquarters */}
          <Card className="mb-6 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => window.location.href = '/gestao/ia/configuracoes'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    QG das IAs
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    Central de configuração e orquestração de inteligência artificial
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Acesso protegido por senha secundária
                </span>
                <span className="text-purple-500 font-medium">
                  Acessar Configurações →
                </span>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Eventos do Funil de Agendamento (30 dias)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {funnelData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={funnelData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {funnelData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Sem dados do funil
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Estatísticas do Banco
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Perfis de Usuário</span>
                        <span className="font-semibold">{kpis.totalUsers}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Veículos</span>
                        <span className="font-semibold">{kpis.totalVehicles}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Agendamentos</span>
                        <span className="font-semibold">{kpis.totalAppointments}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Eventos do Funil</span>
                        <span className="font-semibold">{funnelData.reduce((a, b) => a + b.value, 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CustomizableDashboard>
      </div>
    </AdminLayout>
  );
}

