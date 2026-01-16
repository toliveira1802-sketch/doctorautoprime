import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import type { Database } from "@/integrations/supabase/types";

type WidgetType = Database["public"]["Enums"]["widget_type"];

interface Widget {
  id: string;
  titulo: string;
  tipo: WidgetType;
  tamanho: string;
  cor: string | null;
  icone: string | null;
  fonte_dados: string;
  query_config: Record<string, any> | null;
  valor_fixo: string | null;
}

interface WidgetCardProps {
  widget: Widget;
  refreshKey: number;
  onDelete: () => void;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface ListItem {
  label: string;
  value: string | number;
}

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
];

export function WidgetCard({ widget, refreshKey, onDelete }: WidgetCardProps) {
  const [value, setValue] = useState<string | number>("-");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [listData, setListData] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");

  const isChartWidget = ["grafico_linha", "grafico_barra", "grafico_pizza"].includes(widget.tipo);
  const isListWidget = ["lista", "tabela"].includes(widget.tipo);

  useEffect(() => {
    fetchData();
  }, [widget.id, refreshKey]);

  async function fetchData() {
    setIsLoading(true);

    try {
      if (widget.valor_fixo) {
        setValue(widget.valor_fixo);
        setIsLoading(false);
        return;
      }

      const config = widget.query_config || {};
      const tabela = widget.fonte_dados;

      if (isChartWidget) {
        await fetchChartData(tabela, config);
      } else if (isListWidget) {
        await fetchListData(tabela, config);
      } else {
        await fetchSimpleData(tabela, config);
      }

      if (config.mostrar_tendencia) {
        setTrend(Math.random() > 0.5 ? "up" : "down");
      }
    } catch (err) {
      console.error("Erro ao buscar dados do widget:", err);
      setValue("-");
      setChartData([]);
      setListData([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchListData(tabela: string, config: Record<string, any>) {
    const limite = config.limite || 10;
    
    if (tabela === "appointments") {
      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_date, status, final_price")
        .order("appointment_date", { ascending: false })
        .limit(limite);
      
      if (data) {
        setListData(data.map(item => ({
          label: formatDate(item.appointment_date),
          value: formatCurrency(Number(item.final_price))
        })));
      }
    } else if (tabela === "ordens_servico") {
      const { data } = await supabase
        .from("ordens_servico")
        .select("numero_os, vehicle, status, valor_final")
        .order("created_at", { ascending: false })
        .limit(limite);
      
      if (data) {
        setListData(data.map(item => ({
          label: `${item.numero_os} - ${item.vehicle}`,
          value: formatCurrency(Number(item.valor_final || 0))
        })));
      }
    } else if (tabela === "mechanics") {
      const { data } = await supabase
        .from("mechanics")
        .select("name, specialty")
        .eq("is_active", true)
        .limit(limite);
      
      if (data) {
        setListData(data.map(item => ({
          label: item.name,
          value: item.specialty || "Geral"
        })));
      }
    } else if (tabela === "services") {
      const { data } = await supabase
        .from("services")
        .select("name, price")
        .eq("is_active", true)
        .order("display_order")
        .limit(limite);
      
      if (data) {
        setListData(data.map(item => ({
          label: item.name,
          value: formatCurrency(Number(item.price))
        })));
      }
    } else if (tabela === "feedbacks") {
      const { data } = await supabase
        .from("feedbacks")
        .select("rating, comment, created_at")
        .order("created_at", { ascending: false })
        .limit(limite);
      
      if (data) {
        setListData(data.map(item => ({
          label: item.comment?.substring(0, 50) || "Sem comentário",
          value: `⭐ ${item.rating || 0}`
        })));
      }
    } else {
      setListData([]);
    }
  }

  async function fetchChartData(tabela: string, config: Record<string, any>) {
    if (tabela === "appointments") {
      const { data } = await supabase
        .from("appointments")
        .select("status, appointment_date")
        .gte("appointment_date", getDateRange(config.periodo));

      if (data) {
        if (widget.tipo === "grafico_pizza") {
          const statusCount: Record<string, number> = {};
          data.forEach((item) => {
            statusCount[item.status] = (statusCount[item.status] || 0) + 1;
          });
          
          const chartPoints: ChartDataPoint[] = Object.entries(statusCount).map(([status, count], index) => ({
            name: formatStatus(status),
            value: count,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }));
          setChartData(chartPoints);
        } else {
          const dateCount: Record<string, number> = {};
          data.forEach((item) => {
            const date = item.appointment_date;
            dateCount[date] = (dateCount[date] || 0) + 1;
          });

          const sortedDates = Object.keys(dateCount).sort();
          const chartPoints: ChartDataPoint[] = sortedDates.slice(-7).map((date) => ({
            name: formatDate(date),
            value: dateCount[date],
          }));
          setChartData(chartPoints);
        }
      }
    } else if (tabela === "faturamento") {
      const { data } = await supabase
        .from("faturamento")
        .select("valor, data_entrega")
        .gte("data_entrega", getDateRange(config.periodo))
        .order("data_entrega", { ascending: true });

      if (data) {
        const dateSum: Record<string, number> = {};
        data.forEach((item) => {
          const date = item.data_entrega;
          dateSum[date] = (dateSum[date] || 0) + Number(item.valor);
        });

        const chartPoints: ChartDataPoint[] = Object.entries(dateSum).slice(-7).map(([date, sum]) => ({
          name: formatDate(date),
          value: sum,
        }));
        setChartData(chartPoints);
      }
    } else if (tabela === "ordens_servico") {
      const { data } = await supabase
        .from("ordens_servico")
        .select("status, created_at, valor_final")
        .gte("created_at", getDateRange(config.periodo));

      if (data) {
        if (widget.tipo === "grafico_pizza") {
          const statusCount: Record<string, number> = {};
          data.forEach((item) => {
            statusCount[item.status] = (statusCount[item.status] || 0) + 1;
          });
          
          const chartPoints: ChartDataPoint[] = Object.entries(statusCount).map(([status, count], index) => ({
            name: status,
            value: count,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }));
          setChartData(chartPoints);
        } else {
          const dateSum: Record<string, number> = {};
          data.forEach((item) => {
            const date = item.created_at.split("T")[0];
            dateSum[date] = (dateSum[date] || 0) + Number(item.valor_final || 0);
          });

          const chartPoints: ChartDataPoint[] = Object.entries(dateSum).slice(-7).map(([date, sum]) => ({
            name: formatDate(date),
            value: sum,
          }));
          setChartData(chartPoints);
        }
      }
    } else {
      setChartData([]);
    }
  }

  async function fetchSimpleData(tabela: string, config: Record<string, any>) {
    const operacao = config.operacao || "count";
    
    if (tabela === "manual" || tabela === "formula") {
      const { data } = await supabase
        .from("gestao_dados_manuais")
        .select("valor")
        .eq("widget_id", widget.id)
        .order("data_referencia", { ascending: false })
        .limit(1)
        .single();
      
      setValue(data?.valor || "-");
    } else if (tabela === "appointments") {
      let query = supabase.from("appointments").select("*", { count: "exact", head: true });
      
      if (config.status && config.status !== "all") {
        query = query.eq("status", config.status);
      }
      if (config.periodo === "hoje") {
        query = query.eq("appointment_date", new Date().toISOString().split("T")[0]);
      } else if (config.periodo === "mes") {
        const inicio = new Date();
        inicio.setDate(1);
        query = query.gte("appointment_date", inicio.toISOString().split("T")[0]);
      }

      const { count } = await query;
      setValue(formatValue(count || 0, config));
    } else if (tabela === "faturamento") {
      let query = supabase.from("faturamento").select("valor");
      
      if (config.periodo === "mes") {
        const inicio = new Date();
        inicio.setDate(1);
        query = query.gte("data_entrega", inicio.toISOString().split("T")[0]);
      }

      const { data } = await query;
      const total = data?.reduce((sum, row) => sum + Number(row.valor), 0) || 0;
      setValue(formatCurrency(total));
    } else if (tabela === "vehicles") {
      const { count } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      setValue(formatValue(count || 0, config));
    } else if (tabela === "profiles") {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      setValue(formatValue(count || 0, config));
    } else if (tabela === "ordens_servico") {
      let query = supabase.from("ordens_servico").select("*", { count: "exact", head: true });
      
      if (config.status && config.status !== "all") {
        query = query.eq("status", config.status);
      }

      const { count } = await query;
      setValue(formatValue(count || 0, config));
    } else if (tabela === "mechanics") {
      const { count } = await supabase
        .from("mechanics")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      setValue(formatValue(count || 0, config));
    } else if (tabela === "services") {
      const { count } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      setValue(formatValue(count || 0, config));
    } else if (tabela === "feedbacks") {
      if (operacao === "avg") {
        const { data } = await supabase
          .from("feedbacks")
          .select("rating");
        
        const ratings = data?.filter(f => f.rating).map(f => f.rating!) || [];
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        setValue(avg.toFixed(1));
      } else {
        const { count } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact", head: true });
        
        setValue(formatValue(count || 0, config));
      }
    } else if (tabela === "alerts") {
      const { count } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled");
      
      setValue(formatValue(count || 0, config));
    } else if (tabela === "recovery_leads") {
      const { count } = await supabase
        .from("recovery_leads")
        .select("*", { count: "exact", head: true })
        .eq("recovery_status", "pending");
      
      setValue(formatValue(count || 0, config));
    } else if (tabela === "metas_financeiras") {
      const now = new Date();
      const { data } = await supabase
        .from("metas_financeiras")
        .select("meta_faturamento")
        .eq("mes", now.getMonth() + 1)
        .eq("ano", now.getFullYear())
        .single();
      
      setValue(data ? formatCurrency(Number(data.meta_faturamento)) : "-");
    } else {
      setValue("-");
    }
  }

  function formatValue(value: number, config: Record<string, any>): string {
    const prefixo = config.prefixo || "";
    const sufixo = config.sufixo || "";
    const casas = config.casas_decimais || 0;
    
    const formatted = casas > 0 ? value.toFixed(casas) : String(value);
    return `${prefixo}${formatted}${sufixo}`;
  }

  function getDateRange(periodo: string): string {
    const date = new Date();
    switch (periodo) {
      case "hoje":
        return date.toISOString().split("T")[0];
      case "ontem":
        date.setDate(date.getDate() - 1);
        return date.toISOString().split("T")[0];
      case "semana":
        date.setDate(date.getDate() - 7);
        return date.toISOString().split("T")[0];
      case "semana_passada":
        date.setDate(date.getDate() - 14);
        return date.toISOString().split("T")[0];
      case "mes":
        date.setDate(1);
        return date.toISOString().split("T")[0];
      case "mes_passado":
        date.setMonth(date.getMonth() - 1);
        date.setDate(1);
        return date.toISOString().split("T")[0];
      case "trimestre":
        date.setMonth(date.getMonth() - 3);
        return date.toISOString().split("T")[0];
      case "ultimos_7":
        date.setDate(date.getDate() - 7);
        return date.toISOString().split("T")[0];
      case "ultimos_30":
        date.setDate(date.getDate() - 30);
        return date.toISOString().split("T")[0];
      case "ultimos_90":
        date.setDate(date.getDate() - 90);
        return date.toISOString().split("T")[0];
      case "ano":
        date.setMonth(0);
        date.setDate(1);
        return date.toISOString().split("T")[0];
      default:
        date.setMonth(date.getMonth() - 12);
        return date.toISOString().split("T")[0];
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  function formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      concluido: "Concluído",
      cancelado: "Cancelado",
      em_execucao: "Em Execução",
      aguardando_pecas: "Aguard. Peças",
      pronto_retirada: "Pronto",
    };
    return statusMap[status] || status;
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const bgColor = widget.cor ? `${widget.cor}15` : undefined;
  const textColor = widget.cor || "#3b82f6";

  const WidgetHeader = () => (
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {widget.titulo}
      </CardTitle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
  );

  const LoadingSkeleton = () => (
    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
  );

  // Gráfico de Linha
  if (widget.tipo === "grafico_linha") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={textColor} 
                  strokeWidth={2}
                  dot={{ fill: textColor, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Gráfico de Barras
  if (widget.tipo === "grafico_barra") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="value" fill={textColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Gráfico de Pizza
  if (widget.tipo === "grafico_pizza") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Gauge/Velocímetro
  if (widget.tipo === "gauge") {
    const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    const meta = widget.query_config?.meta ? parseFloat(widget.query_config.meta) : 100;
    const percentage = Math.min(100, Math.max(0, (numValue / meta) * 100));
    const rotation = (percentage / 100) * 180 - 90;

    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent className="flex flex-col items-center">
          {isLoading ? (
            <div className="h-32 w-32 bg-muted animate-pulse rounded-full" />
          ) : (
            <>
              <div className="relative w-32 h-16 overflow-hidden">
                <div 
                  className="absolute w-32 h-32 rounded-full border-8"
                  style={{ 
                    borderColor: `${textColor}30`,
                    clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)"
                  }}
                />
                <div 
                  className="absolute w-32 h-32 rounded-full border-8"
                  style={{ 
                    borderColor: textColor,
                    clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 50%)`,
                    transform: `rotate(${rotation - 90}deg)`,
                    transformOrigin: "center",
                    opacity: percentage / 100
                  }}
                />
                <div 
                  className="absolute bottom-0 left-1/2 w-1 h-12 -translate-x-1/2 origin-bottom"
                  style={{ 
                    backgroundColor: textColor,
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              </div>
              <span className="text-2xl font-bold mt-2" style={{ color: textColor }}>
                {percentage.toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {numValue} / {meta}
              </span>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Lista
  if (widget.tipo === "lista") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {listData.length > 0 ? listData.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                  <span className="truncate flex-1">{item.label}</span>
                  <span className="font-medium ml-2" style={{ color: textColor }}>{item.value}</span>
                </li>
              )) : (
                <li className="text-sm text-muted-foreground">Nenhum dado encontrado</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  // Tabela
  if (widget.tipo === "tabela") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Item</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {listData.length > 0 ? listData.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/50 last:border-0">
                      <td className="py-2 truncate max-w-[150px]">{item.label}</td>
                      <td className="py-2 text-right font-medium" style={{ color: textColor }}>{item.value}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="py-2 text-muted-foreground text-center">Nenhum dado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Card com Número
  if (widget.tipo === "card_numero") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold" style={{ color: textColor }}>
                {value}
              </span>
              {trend !== "neutral" && (
                <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                  {trend === "up" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Card com Percentual
  if (widget.tipo === "card_percentual") {
    const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    const percentage = Math.min(100, Math.max(0, numValue));

    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
        <WidgetHeader />
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <span className="text-3xl font-bold" style={{ color: textColor }}>
                {percentage}%
              </span>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: textColor,
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback para outros tipos (texto, etc)
  return (
    <Card className="relative group" style={{ backgroundColor: bgColor }}>
      <WidgetHeader />
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <span className="text-2xl font-bold" style={{ color: textColor }}>
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
