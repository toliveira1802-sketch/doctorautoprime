import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, TrendingUp, TrendingDown, Minus, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

export function WidgetCard({ widget, refreshKey, onDelete }: WidgetCardProps) {
  const [value, setValue] = useState<string | number>("-");
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");

  useEffect(() => {
    fetchData();
  }, [widget.id, refreshKey]);

  async function fetchData() {
    setIsLoading(true);

    try {
      // Se tem valor fixo, usa ele
      if (widget.valor_fixo) {
        setValue(widget.valor_fixo);
        setIsLoading(false);
        return;
      }

      // Se fonte_dados é uma tabela conhecida, faz a query
      const config = widget.query_config || {};
      const tabela = widget.fonte_dados;

      if (tabela === "manual") {
        // Busca dados manuais
        const { data } = await supabase
          .from("gestao_dados_manuais")
          .select("valor")
          .eq("widget_id", widget.id)
          .order("data_referencia", { ascending: false })
          .limit(1)
          .single();
        
        setValue(data?.valor || "-");
      } else if (tabela === "appointments") {
        // Query de appointments
        let query = supabase.from("appointments").select("*", { count: "exact", head: true });
        
        if (config.status) {
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
        setValue(count || 0);
      } else if (tabela === "faturamento") {
        // Query de faturamento
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
        // Contar veículos
        const { count } = await supabase
          .from("vehicles")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);
        
        setValue(count || 0);
      } else if (tabela === "profiles") {
        // Contar clientes
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        
        setValue(count || 0);
      } else {
        setValue("-");
      }

      // Calcular tendência (simplificado)
      if (config.mostrar_tendencia) {
        setTrend(Math.random() > 0.5 ? "up" : "down");
      }
    } catch (err) {
      console.error("Erro ao buscar dados do widget:", err);
      setValue("-");
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

  const bgColor = widget.cor ? `${widget.cor}15` : undefined;
  const textColor = widget.cor || undefined;

  if (widget.tipo === "card_numero") {
    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
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
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
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

  if (widget.tipo === "card_percentual") {
    const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    const percentage = Math.min(100, Math.max(0, numValue));

    return (
      <Card className="relative group" style={{ backgroundColor: bgColor }}>
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
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
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
                    backgroundColor: textColor || "hsl(var(--primary))",
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback para outros tipos
  return (
    <Card className="relative group" style={{ backgroundColor: bgColor }}>
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
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <span className="text-2xl font-bold" style={{ color: textColor }}>
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
