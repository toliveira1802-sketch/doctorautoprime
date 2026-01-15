import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ExportButtons } from "@/components/gestao/ExportButtons";
import { AddDirectoryDialog } from "@/components/gestao/AddDirectoryDialog";
import { exportToPDF, exportToExcel, type ReportData } from "@/utils/exportReport";
import { DollarSign, TrendingUp, TrendingDown, Receipt, Loader2, Target, Plus } from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyRevenue {
  date: string;
  value: number;
}

export default function GestaoFinanceiro() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    avgTicket: 0,
    totalAppointments: 0,
    monthGoal: 100000,
    goalProgress: 0,
  });
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startDate = startOfMonth.toISOString().split("T")[0];

      // Buscar faturamento do mês
      const { data: faturamento } = await supabase
        .from("faturamento")
        .select("id, valor, data_entrega, created_at")
        .gte("data_entrega", startDate)
        .order("data_entrega", { ascending: true });

      // Buscar meta do mês
      const { data: meta } = await supabase
        .from("metas_financeiras")
        .select("meta_faturamento")
        .eq("ano", new Date().getFullYear())
        .eq("mes", new Date().getMonth() + 1)
        .single();

      if (faturamento) {
        const totalRevenue = faturamento.reduce((sum, f) => sum + Number(f.valor), 0);
        const avgTicket = faturamento.length > 0 ? totalRevenue / faturamento.length : 0;
        const monthGoal = meta?.meta_faturamento || 100000;

        setKpis({
          totalRevenue,
          avgTicket,
          totalAppointments: faturamento.length,
          monthGoal,
          goalProgress: Math.round((totalRevenue / monthGoal) * 100),
        });

        // Agrupar por dia para gráfico
        const dailyMap: Record<string, number> = {};
        faturamento.forEach(f => {
          dailyMap[f.data_entrega] = (dailyMap[f.data_entrega] || 0) + Number(f.valor);
        });

        // Preencher dias sem faturamento
        const today = new Date();
        const days = eachDayOfInterval({ start: startOfMonth, end: today });
        const dailyData = days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          return {
            date: format(day, "dd/MM", { locale: ptBR }),
            value: dailyMap[dateStr] || 0,
          };
        });

        setDailyRevenue(dailyData);
        setRecentTransactions(faturamento.slice(-10).reverse());
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function getReportData(): ReportData {
    return {
      title: "Relatório Financeiro",
      subtitle: "Doctor Auto Prime",
      kpis: [
        { label: "Faturamento do Mês", value: formatCurrency(kpis.totalRevenue) },
        { label: "Ticket Médio", value: formatCurrency(kpis.avgTicket) },
        { label: "Quantidade de Serviços", value: kpis.totalAppointments },
        { label: "Meta do Mês", value: formatCurrency(kpis.monthGoal) },
        { label: "Progresso da Meta", value: `${kpis.goalProgress}%` },
      ],
      tables: [
        {
          title: "Faturamento Diário",
          headers: ["Data", "Valor"],
          rows: dailyRevenue.map(d => [d.date, formatCurrency(d.value)]),
        },
      ],
    };
  }

  const statCards = [
    { label: "Faturamento (Mês)", value: formatCurrency(kpis.totalRevenue), icon: DollarSign, color: "text-green-500" },
    { label: "Ticket Médio", value: formatCurrency(kpis.avgTicket), icon: Receipt, color: "text-blue-500" },
    { label: "Serviços Faturados", value: kpis.totalAppointments, icon: TrendingUp, color: "text-purple-500" },
    { label: "Meta do Mês", value: formatCurrency(kpis.monthGoal), icon: Target, color: "text-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              Financeiro
            </h1>
            <p className="text-muted-foreground mt-1">
              Indicadores financeiros do mês atual
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
              {statCards.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Faturamento Diário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), "Valor"]}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--popover))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                        />
                      </LineChart>
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
                    <Target className="w-5 h-5" />
                    Progresso da Meta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-5xl font-bold text-primary">
                      {kpis.goalProgress}%
                    </p>
                    <p className="text-muted-foreground mt-2">
                      {formatCurrency(kpis.totalRevenue)} de {formatCurrency(kpis.monthGoal)}
                    </p>
                    <div className="w-full mt-4 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(kpis.goalProgress, 100)}%` }}
                      />
                    </div>
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
