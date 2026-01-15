import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Settings, RefreshCw } from "lucide-react";
import { WidgetCard } from "@/components/gestao/WidgetCard";
import { AddWidgetDialog } from "@/components/gestao/AddWidgetDialog";
import type { Database } from "@/integrations/supabase/types";

type WidgetType = Database["public"]["Enums"]["widget_type"];

interface Dashboard {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
}

interface Widget {
  id: string;
  dashboard_id: string;
  titulo: string;
  tipo: WidgetType;
  tamanho: string;
  cor: string | null;
  icone: string | null;
  ordem: number;
  fonte_dados: string;
  query_config: Record<string, any> | null;
  valor_fixo: string | null;
  ativo: boolean;
}

export default function GestaoDashboardView() {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (dashboardId) {
      fetchDashboard();
      fetchWidgets();
    }
  }, [dashboardId]);

  async function fetchDashboard() {
    try {
      const { data, error } = await supabase
        .from("gestao_dashboards")
        .select("*")
        .eq("id", dashboardId)
        .single();

      if (error) throw error;
      setDashboard(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      toast.error("Dashboard não encontrado");
      navigate("/gestao");
    }
  }

  async function fetchWidgets() {
    try {
      const { data, error } = await supabase
        .from("gestao_widgets")
        .select("*")
        .eq("dashboard_id", dashboardId)
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      setWidgets((data as Widget[]) || []);
    } catch (err) {
      console.error("Erro ao carregar widgets:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    toast.success("Dados atualizados");
  }

  function handleWidgetCreated() {
    setIsAddWidgetOpen(false);
    fetchWidgets();
  }

  async function handleDeleteWidget(widgetId: string) {
    if (!confirm("Excluir este widget?")) return;
    
    try {
      const { error } = await supabase
        .from("gestao_widgets")
        .delete()
        .eq("id", widgetId);
      
      if (error) throw error;
      toast.success("Widget excluído");
      fetchWidgets();
    } catch (err) {
      console.error("Erro ao excluir widget:", err);
      toast.error("Erro ao excluir widget");
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!dashboard) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Dashboard não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  const getWidgetGridClass = (tamanho: string) => {
    switch (tamanho) {
      case "sm":
        return "col-span-1";
      case "lg":
        return "col-span-2";
      case "xl":
        return "col-span-3";
      default:
        return "col-span-1 md:col-span-1";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gestao")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ color: dashboard.cor }}>
                {dashboard.nome}
              </h1>
              {dashboard.descricao && (
                <p className="text-muted-foreground">{dashboard.descricao}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate(`/gestao/dashboard/${dashboardId}/editar`)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Widget
            </Button>
          </div>
        </div>

        {/* Widgets Grid */}
        {widgets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Dashboard vazio
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione widgets para visualizar seus indicadores
              </p>
              <Button onClick={() => setIsAddWidgetOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Widget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => (
              <div key={widget.id} className={getWidgetGridClass(widget.tamanho)}>
                <WidgetCard 
                  widget={widget} 
                  refreshKey={refreshKey}
                  onDelete={() => handleDeleteWidget(widget.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Widget Dialog */}
        <AddWidgetDialog
          open={isAddWidgetOpen}
          onOpenChange={setIsAddWidgetOpen}
          dashboardId={dashboardId!}
          onSuccess={handleWidgetCreated}
        />
      </div>
    </AdminLayout>
  );
}
