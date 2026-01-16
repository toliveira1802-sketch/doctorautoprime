import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BarChart3, PieChart, LineChart, Hash, Percent, FileText, 
  Gauge, Table, List, Calculator, Target, Clock, Calendar,
  Users, Car, DollarSign, Wrench, TrendingUp, AlertTriangle
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type WidgetType = Database["public"]["Enums"]["widget_type"];

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
  onSuccess: () => void;
}

// Fontes de dados disponíveis expandidas
const FONTES_DADOS = [
  { value: "manual", label: "📝 Valor Manual", description: "Digite qualquer valor ou texto" },
  { value: "formula", label: "🧮 Fórmula/Cálculo", description: "Crie cálculos personalizados" },
  { value: "appointments", label: "📅 Agendamentos", description: "Dados de agendamentos" },
  { value: "faturamento", label: "💰 Faturamento", description: "Dados financeiros" },
  { value: "vehicles", label: "🚗 Veículos", description: "Dados de veículos" },
  { value: "profiles", label: "👥 Clientes", description: "Dados de clientes" },
  { value: "ordens_servico", label: "🔧 Ordens de Serviço", description: "Dados de OS" },
  { value: "mechanics", label: "👷 Mecânicos", description: "Dados de mecânicos" },
  { value: "services", label: "🛠️ Serviços", description: "Catálogo de serviços" },
  { value: "metas_financeiras", label: "🎯 Metas Financeiras", description: "Metas e objetivos" },
  { value: "feedbacks", label: "⭐ Feedbacks", description: "Avaliações de clientes" },
  { value: "alerts", label: "🔔 Alertas", description: "Alertas do sistema" },
  { value: "recovery_leads", label: "📞 Leads Recuperação", description: "Leads para recuperar" },
];

// Tipos de widgets expandidos
const TIPOS_WIDGET: { value: WidgetType; label: string; icon: any; description: string }[] = [
  { value: "card_numero", label: "Card Número", icon: Hash, description: "Exibe um valor numérico grande" },
  { value: "card_percentual", label: "Card Percentual", icon: Percent, description: "Percentual com barra de progresso" },
  { value: "gauge", label: "Gauge/Velocímetro", icon: Gauge, description: "Indicador circular de progresso" },
  { value: "grafico_linha", label: "Gráfico de Linha", icon: LineChart, description: "Evolução ao longo do tempo" },
  { value: "grafico_barra", label: "Gráfico de Barras", icon: BarChart3, description: "Comparação entre categorias" },
  { value: "grafico_pizza", label: "Gráfico de Pizza", icon: PieChart, description: "Distribuição proporcional" },
  { value: "lista", label: "Lista", icon: List, description: "Lista de itens" },
  { value: "tabela", label: "Tabela", icon: Table, description: "Dados em formato de tabela" },
  { value: "texto", label: "Texto/Nota", icon: FileText, description: "Texto livre ou anotação" },
];

const TAMANHOS = [
  { value: "sm", label: "Pequeno", cols: "1 coluna" },
  { value: "md", label: "Médio", cols: "2 colunas" },
  { value: "lg", label: "Grande", cols: "3 colunas" },
  { value: "xl", label: "Extra Grande", cols: "4 colunas" },
  { value: "full", label: "Largura Total", cols: "Linha inteira" },
];

const PERIODOS = [
  { value: "hoje", label: "Hoje" },
  { value: "ontem", label: "Ontem" },
  { value: "semana", label: "Esta Semana" },
  { value: "semana_passada", label: "Semana Passada" },
  { value: "mes", label: "Este Mês" },
  { value: "mes_passado", label: "Mês Passado" },
  { value: "trimestre", label: "Este Trimestre" },
  { value: "ano", label: "Este Ano" },
  { value: "ultimos_7", label: "Últimos 7 dias" },
  { value: "ultimos_30", label: "Últimos 30 dias" },
  { value: "ultimos_90", label: "Últimos 90 dias" },
  { value: "todos", label: "Todos" },
];

const OPERACOES = [
  { value: "count", label: "Contar registros" },
  { value: "sum", label: "Somar valores" },
  { value: "avg", label: "Média" },
  { value: "min", label: "Valor mínimo" },
  { value: "max", label: "Valor máximo" },
  { value: "last", label: "Último valor" },
];

const CORES_PRESET = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7", "#eab308", "#22c55e", "#0ea5e9",
];

export function AddWidgetDialog({ open, onOpenChange, dashboardId, onSuccess }: AddWidgetDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basico");
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "card_numero" as WidgetType,
    fonte_dados: "manual",
    tamanho: "md",
    cor: "#3b82f6",
    valor_fixo: "",
    icone: "",
    config: {
      operacao: "count",
      campo: "",
      status: "all",
      periodo: "mes",
      filtro_extra: "",
      mostrar_tendencia: false,
      mostrar_comparativo: false,
      meta: "",
      unidade: "",
      prefixo: "",
      sufixo: "",
      casas_decimais: 0,
      formula: "",
      agrupar_por: "",
      ordenar_por: "",
      limite: 10,
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
        icone: formData.icone || null,
        valor_fixo: formData.fonte_dados === "manual" || formData.fonte_dados === "formula" 
          ? formData.valor_fixo 
          : null,
        query_config: formData.fonte_dados !== "manual" ? formData.config : null,
      });

      if (error) throw error;

      toast.success("Widget criado com sucesso!");
      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Erro ao criar widget:", err);
      toast.error("Erro ao criar widget");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      titulo: "",
      tipo: "card_numero",
      fonte_dados: "manual",
      tamanho: "md",
      cor: "#3b82f6",
      valor_fixo: "",
      icone: "",
      config: {
        operacao: "count",
        campo: "",
        status: "all",
        periodo: "mes",
        filtro_extra: "",
        mostrar_tendencia: false,
        mostrar_comparativo: false,
        meta: "",
        unidade: "",
        prefixo: "",
        sufixo: "",
        casas_decimais: 0,
        formula: "",
        agrupar_por: "",
        ordenar_por: "",
        limite: 10,
      },
    });
    setActiveTab("basico");
  }

  const updateConfig = (key: string, value: any) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [key]: value },
    });
  };

  const selectedTipo = TIPOS_WIDGET.find(t => t.value === formData.tipo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTipo && <selectedTipo.icon className="w-5 h-5" />}
            Criar Novo Widget
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basico" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título do Widget *</Label>
              <Input
                placeholder="Ex: Total de Vendas, Meta do Mês, etc."
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Visualização</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS_WIDGET.map((tipo) => (
                  <Button
                    key={tipo.value}
                    type="button"
                    variant={formData.tipo === tipo.value ? "default" : "outline"}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                  >
                    <tipo.icon className="w-5 h-5" />
                    <span className="text-xs">{tipo.label}</span>
                  </Button>
                ))}
              </div>
              {selectedTipo && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTipo.description}
                </p>
              )}
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
                      {tam.label} ({tam.cols})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Aba Dados */}
          <TabsContent value="dados" className="space-y-4 mt-4">
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
                      <div className="flex flex-col">
                        <span>{fonte.label}</span>
                        <span className="text-xs text-muted-foreground">{fonte.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor Manual */}
            {formData.fonte_dados === "manual" && (
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  placeholder="Digite qualquer valor: número, texto, R$ 1.000, etc."
                  value={formData.valor_fixo}
                  onChange={(e) => setFormData({ ...formData, valor_fixo: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Este valor será exibido diretamente no widget
                </p>
              </div>
            )}

            {/* Fórmula */}
            {formData.fonte_dados === "formula" && (
              <div className="space-y-2">
                <Label>Fórmula / Expressão</Label>
                <Textarea
                  placeholder="Ex: (vendas_mes / meta_mes) * 100"
                  value={formData.valor_fixo}
                  onChange={(e) => setFormData({ ...formData, valor_fixo: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Use variáveis de outros widgets ou valores fixos
                </p>
              </div>
            )}

            {/* Configurações para fontes de dados dinâmicas */}
            {!["manual", "formula"].includes(formData.fonte_dados) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Operação</Label>
                    <Select
                      value={formData.config.operacao}
                      onValueChange={(value) => updateConfig("operacao", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERACOES.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select
                      value={formData.config.periodo}
                      onValueChange={(value) => updateConfig("periodo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODOS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Campos específicos por fonte de dados */}
                {formData.fonte_dados === "appointments" && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.config.status}
                      onValueChange={(value) => updateConfig("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="em_execucao">Em Execução</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="aguardando_pecas">Aguardando Peças</SelectItem>
                        <SelectItem value="pronto_retirada">Pronto para Retirada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.fonte_dados === "ordens_servico" && (
                  <div className="space-y-2">
                    <Label>Status da OS</Label>
                    <Select
                      value={formData.config.status}
                      onValueChange={(value) => updateConfig("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="em_execucao">Em Execução</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.fonte_dados === "faturamento" && (
                  <div className="space-y-2">
                    <Label>Campo para Cálculo</Label>
                    <Select
                      value={formData.config.campo}
                      onValueChange={(value) => updateConfig("campo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o campo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valor">Valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {["grafico_linha", "grafico_barra", "grafico_pizza"].includes(formData.tipo) && (
                  <div className="space-y-2">
                    <Label>Agrupar Por</Label>
                    <Select
                      value={formData.config.agrupar_por}
                      onValueChange={(value) => updateConfig("agrupar_por", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o agrupamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dia">Dia</SelectItem>
                        <SelectItem value="semana">Semana</SelectItem>
                        <SelectItem value="mes">Mês</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="mecanico">Mecânico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Aba Visual */}
          <TabsContent value="visual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Cor Principal</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CORES_PRESET.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.cor === cor ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: cor }}
                    onClick={() => setFormData({ ...formData, cor })}
                  />
                ))}
              </div>
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
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prefixo</Label>
                <Input
                  placeholder="Ex: R$, $, €"
                  value={formData.config.prefixo}
                  onChange={(e) => updateConfig("prefixo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sufixo</Label>
                <Input
                  placeholder="Ex: %, veículos, clientes"
                  value={formData.config.sufixo}
                  onChange={(e) => updateConfig("sufixo", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input
                placeholder="Ex: unidades, reais, horas"
                value={formData.config.unidade}
                onChange={(e) => updateConfig("unidade", e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Aba Avançado */}
          <TabsContent value="avancado" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Tendência</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe seta indicando se o valor subiu ou desceu
                </p>
              </div>
              <Switch
                checked={formData.config.mostrar_tendencia}
                onCheckedChange={(checked) => updateConfig("mostrar_tendencia", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Comparativo</Label>
                <p className="text-xs text-muted-foreground">
                  Compara com o período anterior
                </p>
              </div>
              <Switch
                checked={formData.config.mostrar_comparativo}
                onCheckedChange={(checked) => updateConfig("mostrar_comparativo", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Meta (para gauge/percentual)</Label>
              <Input
                type="number"
                placeholder="Ex: 100, 50000"
                value={formData.config.meta}
                onChange={(e) => updateConfig("meta", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Define o valor 100% para widgets de progresso
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Casas Decimais</Label>
                <Select
                  value={String(formData.config.casas_decimais)}
                  onValueChange={(value) => updateConfig("casas_decimais", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Limite de Itens</Label>
                <Input
                  type="number"
                  value={formData.config.limite}
                  onChange={(e) => updateConfig("limite", parseInt(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filtro Extra (SQL)</Label>
              <Input
                placeholder="Ex: valor > 1000"
                value={formData.config.filtro_extra}
                onChange={(e) => updateConfig("filtro_extra", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Condição adicional para filtrar os dados (avançado)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview do Widget */}
        <div className="mt-4 p-4 rounded-lg border bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${formData.cor}15` }}
          >
            <p className="text-sm text-muted-foreground">{formData.titulo || "Título do Widget"}</p>
            <p className="text-2xl font-bold" style={{ color: formData.cor }}>
              {formData.config.prefixo}
              {formData.valor_fixo || "123"}
              {formData.config.sufixo}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Widget"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
