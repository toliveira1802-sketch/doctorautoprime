import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ExportButtons } from "@/components/gestao/ExportButtons";
import { AddDirectoryDialog } from "@/components/gestao/AddDirectoryDialog";
import { exportToPDF, exportToExcel, type ReportData } from "@/utils/exportReport";
import { Cog, Car, Clock, CheckCircle, AlertTriangle, Loader2, BarChart3, Plus } from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

interface AppointmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

interface StatusCount {
  status: string;
  count: number;
}

export default function GestaoOperacoes() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startDate = startOfMonth.toISOString().split("T")[0];

      // Buscar agendamentos do mês
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, status, appointment_date, final_price, created_at")
        .gte("appointment_date", startDate)
        .order("appointment_date", { ascending: false });

      if (appointments) {
        const pending = appointments.filter(a => a.status === "pendente").length;
        const inProgress = appointments.filter(a => 
          ["em_execucao", "aguardando_pecas", "pronto_iniciar"].includes(a.status)
        ).length;
        const completed = appointments.filter(a => a.status === "concluido").length;
        const cancelled = appointments.filter(a => a.status === "cancelado").length;

        setStats({
          total: appointments.length,
          pending,
          inProgress,
          completed,
          cancelled,
        });

        // Agrupar por status para gráfico
        const statusMap: Record<string, number> = {};
        appointments.forEach(a => {
          statusMap[a.status] = (statusMap[a.status] || 0) + 1;
        });

        const statusLabels: Record<string, string> = {
          pendente: "Pendente",
          confirmado: "Confirmado",
          em_execucao: "Em Execução",
          concluido: "Concluído",
          cancelado: "Cancelado",
          aguardando_pecas: "Aguard. Peças",
          pronto_retirada: "Pronto Retirada",
        };

        setStatusData(
          Object.entries(statusMap).map(([status, count]) => ({
            status: statusLabels[status] || status,
            count,
          }))
        );

        setRecentAppointments(appointments.slice(0, 10));
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
      title: "Relatório de Operações",
      subtitle: "Doctor Auto Prime",
      kpis: [
        { label: "Total de Agendamentos (Mês)", value: stats.total },
        { label: "Pendentes", value: stats.pending },
        { label: "Em Andamento", value: stats.inProgress },
        { label: "Concluídos", value: stats.completed },
        { label: "Cancelados", value: stats.cancelled },
        { label: "Taxa de Conclusão", value: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%` },
      ],
      tables: [
        {
          title: "Agendamentos por Status",
          headers: ["Status", "Quantidade"],
          rows: statusData.map(s => [s.status, s.count]),
        },
      ],
    };
  }

  const kpiCards = [
    { label: "Total Agendamentos", value: stats.total, icon: Car, color: "text-blue-500" },
    { label: "Em Andamento", value: stats.inProgress, icon: Clock, color: "text-yellow-500" },
    { label: "Concluídos", value: stats.completed, icon: CheckCircle, color: "text-green-500" },
    { label: "Pendentes", value: stats.pending, icon: AlertTriangle, color: "text-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cog className="w-6 h-6 text-slate-500" />
              Operações
            </h1>
            <p className="text-muted-foreground mt-1">
              Indicadores operacionais do mês atual
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddDirectoryDialog>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Diretório
              </Button>
            </AddDirectoryDialog>
            <ExportButtons
              onExportPDF={() => exportToPDF(getReportData())}
              onExportExcel={() => exportToExcel(getReportData())}
              isLoading={isLoading}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((stat) => (
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
                    <BarChart3 className="w-5 h-5" />
                    Agendamentos por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--popover))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Sem dados para exibir
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Taxa de Conclusão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-5xl font-bold text-primary">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-muted-foreground mt-2">
                      {stats.completed} de {stats.total} serviços concluídos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
