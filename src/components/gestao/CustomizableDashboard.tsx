import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, RefreshCw, Settings2, GripVertical, Trash2 } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { AddWidgetDialog } from "./AddWidgetDialog";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type WidgetType = Database["public"]["Enums"]["widget_type"];

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

interface CustomizableDashboardProps {
  dashboardKey: string; // Unique key to identify this dashboard (e.g., "comercial", "financeiro")
  title?: string;
  children?: React.ReactNode; // Fixed content that always appears
}

export function CustomizableDashboard({ 
  dashboardKey, 
  title,
  children 
}: CustomizableDashboardProps) {
  const queryClient = useQueryClient();
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardId, setDashboardId] = useState<string | null>(null);

  // Get or create the dashboard for this key
  const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["gestao-dashboard", dashboardKey],
    queryFn: async () => {
      // First try to find existing dashboard
      const { data: existing, error: findError } = await supabase
        .from("gestao_dashboards")
        .select("*")
        .eq("nome", `_system_${dashboardKey}`)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        return existing;
      }

      // Create new system dashboard for this key
      const { data: created, error: createError } = await supabase
        .from("gestao_dashboards")
        .insert({
          nome: `_system_${dashboardKey}`,
          descricao: `Dashboard customizável para ${dashboardKey}`,
          ativo: true,
          ordem: 999, // System dashboards are hidden from main list
        })
        .select()
        .single();

      if (createError) throw createError;
      return created;
    },
  });

  useEffect(() => {
    if (dashboard) {
      setDashboardId(dashboard.id);
    }
  }, [dashboard]);

  // Fetch widgets for this dashboard
  const { data: widgets = [], isLoading: isLoadingWidgets } = useQuery({
    queryKey: ["gestao-widgets", dashboardId],
    queryFn: async () => {
      if (!dashboardId) return [];

      const { data, error } = await supabase
        .from("gestao_widgets")
        .select("*")
        .eq("dashboard_id", dashboardId)
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return (data as Widget[]) || [];
    },
    enabled: !!dashboardId,
  });

  // Delete widget mutation
  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: string) => {
      const { error } = await supabase
        .from("gestao_widgets")
        .delete()
        .eq("id", widgetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestao-widgets", dashboardId] });
      toast.success("Widget removido");
    },
    onError: () => {
      toast.error("Erro ao remover widget");
    },
  });

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    queryClient.invalidateQueries({ queryKey: ["gestao-widgets", dashboardId] });
    toast.success("Dados atualizados");
  }

  function handleWidgetCreated() {
    setIsAddWidgetOpen(false);
    queryClient.invalidateQueries({ queryKey: ["gestao-widgets", dashboardId] });
  }

  function handleDeleteWidget(widgetId: string) {
    if (!confirm("Remover este widget?")) return;
    deleteWidgetMutation.mutate(widgetId);
  }

  const getWidgetGridClass = (tamanho: string) => {
    switch (tamanho) {
      case "sm":
        return "col-span-1";
      case "lg":
        return "col-span-2";
      case "xl":
        return "col-span-2 lg:col-span-3";
      default:
        return "col-span-1";
    }
  };

  const isLoading = isLoadingDashboard || isLoadingWidgets;

  return (
    <div className="space-y-6">
      {/* Fixed content from parent */}
      {children}

      {/* Customizable Widgets Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Widgets Personalizados
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {widgets.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant={isEditMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <Settings2 className="w-4 h-4 mr-1" />
              {isEditMode ? "Concluir" : "Editar"}
            </Button>
            <Button 
              size="sm" 
              onClick={() => setIsAddWidgetOpen(true)}
              disabled={!dashboardId}
            >
              <Plus className="w-4 h-4 mr-1" />
              Widget
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : widgets.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-3">
                Personalize seu dashboard adicionando widgets
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddWidgetOpen(true)}
                disabled={!dashboardId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Widget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => (
              <div 
                key={widget.id} 
                className={cn(
                  "relative",
                  getWidgetGridClass(widget.tamanho),
                  isEditMode && "ring-2 ring-dashed ring-primary/30 rounded-lg"
                )}
              >
                {isEditMode && (
                  <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleDeleteWidget(widget.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <WidgetCard 
                  widget={widget} 
                  refreshKey={refreshKey}
                  onDelete={() => handleDeleteWidget(widget.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Widget Dialog */}
      {dashboardId && (
        <AddWidgetDialog
          open={isAddWidgetOpen}
          onOpenChange={setIsAddWidgetOpen}
          dashboardId={dashboardId}
          onSuccess={handleWidgetCreated}
        />
      )}
    </div>
  );
}