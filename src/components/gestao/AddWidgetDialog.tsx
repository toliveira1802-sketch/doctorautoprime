import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type WidgetType = Database["public"]["Enums"]["widget_type"];

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
  onSuccess: () => void;
}

const FONTES_DADOS = [
  { value: "appointments", label: "Agendamentos" },
  { value: "faturamento", label: "Faturamento" },
  { value: "vehicles", label: "Veículos" },
  { value: "profiles", label: "Clientes" },
  { value: "manual", label: "Valor Manual" },
];

const TIPOS_WIDGET: { value: WidgetType; label: string; description?: string }[] = [
  { value: "card_numero", label: "Card com Número", description: "Exibe um valor numérico" },
  { value: "card_percentual", label: "Card com Percentual", description: "Exibe um percentual com barra" },
  { value: "grafico_linha", label: "Gráfico de Linha", description: "Evolução ao longo do tempo" },
  { value: "grafico_barra", label: "Gráfico de Barras", description: "Comparação entre categorias" },
  { value: "grafico_pizza", label: "Gráfico de Pizza", description: "Distribuição proporcional" },
  { value: "texto", label: "Texto", description: "Exibe texto ou valor" },
];

const TAMANHOS = [
  { value: "sm", label: "Pequeno" },
  { value: "md", label: "Médio" },
  { value: "lg", label: "Grande" },
  { value: "xl", label: "Extra Grande" },
];

export function AddWidgetDialog({ open, onOpenChange, dashboardId, onSuccess }: AddWidgetDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "card_numero" as WidgetType,
    fonte_dados: "appointments",
    tamanho: "md",
    cor: "#3b82f6",
    valor_fixo: "",
    config: {
      status: "all",
      periodo: "mes",
    },
  });

  async function handleSubmit() {
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("gestao_widgets").insert({
        dashboard_id: dashboardId,
        titulo: formData.titulo,
        tipo: formData.tipo,
        fonte_dados: formData.fonte_dados,
        tamanho: formData.tamanho,
        cor: formData.cor,
        valor_fixo: formData.fonte_dados === "manual" ? formData.valor_fixo : null,
        query_config: formData.fonte_dados !== "manual" ? formData.config : null,
      });

      if (error) throw error;

      toast.success("Widget criado!");
      setFormData({
        titulo: "",
        tipo: "card_numero",
        fonte_dados: "appointments",
        tamanho: "md",
        cor: "#3b82f6",
        valor_fixo: "",
        config: { status: "all", periodo: "mes" },
      });
      onSuccess();
    } catch (err) {
      console.error("Erro ao criar widget:", err);
      toast.error("Erro ao criar widget");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Total de Agendamentos"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: WidgetType) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_WIDGET.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho</Label>
              <Select
                value={formData.tamanho}
                onValueChange={(value) => setFormData({ ...formData, tamanho: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAMANHOS.map((tam) => (
                    <SelectItem key={tam.value} value={tam.value}>
                      {tam.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fonte de Dados</Label>
            <Select
              value={formData.fonte_dados}
              onValueChange={(value) => setFormData({ ...formData, fonte_dados: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTES_DADOS.map((fonte) => (
                  <SelectItem key={fonte.value} value={fonte.value}>
                    {fonte.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.fonte_dados === "manual" && (
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                placeholder="Digite o valor"
                value={formData.valor_fixo}
                onChange={(e) => setFormData({ ...formData, valor_fixo: e.target.value })}
              />
            </div>
          )}

          {formData.fonte_dados === "appointments" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.config.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, config: { ...formData.config, status: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Período</Label>
                <Select
                  value={formData.config.periodo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, config: { ...formData.config, periodo: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Esta Semana</SelectItem>
                    <SelectItem value="mes">Este Mês</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Widget"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
