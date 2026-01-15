import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Save, Plus, Trash2, Phone, Car, User, 
  Calendar, DollarSign, FileText, Wrench, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, Edit2,
  ClipboardCheck, Camera, ChevronDown, ChevronUp, Gauge, ShieldCheck, Activity, Image,
  TrendingUp, Sparkles, Calculator, Gift, Video, Zap
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrdemServicoItem {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  motivo_recusa: string | null;
}

interface OrdemServico {
  id: string;
  numero_os: string;
  plate: string;
  vehicle: string;
  client_name: string | null;
  client_phone: string | null;
  status: string;
  data_entrada: string | null;
  data_orcamento: string | null;
  data_aprovacao: string | null;
  data_conclusao: string | null;
  data_entrega: string | null;
  valor_orcado: number | null;
  valor_aprovado: number | null;
  valor_final: number | null;
  descricao_problema: string | null;
  diagnostico: string | null;
  observacoes: string | null;
  motivo_recusa: string | null;
  mechanic_id: string | null;
  checklist_entrada: Record<string, boolean> | null;
  checklist_dinamometro: Record<string, boolean> | null;
  checklist_precompra: Record<string, boolean> | null;
  fotos_entrada: string[] | null;
  km_atual: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  diagnostico: { label: "Diagnóstico", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Wrench },
  orcamento: { label: "Orçamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: FileText },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
  parcial: { label: "Parcial", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: AlertTriangle },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  em_execucao: { label: "Em Execução", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Wrench },
  concluido: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  entregue: { label: "Entregue", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: CheckCircle },
};

const itemStatusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export default function AdminOSDetalhes() {
  const { osId } = useParams<{ osId: string }>();
  const [searchParams] = useSearchParams();
  const isNewOS = searchParams.get("new") === "true";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<Partial<OrdemServico>>({});
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [newItem, setNewItem] = useState({
    descricao: "",
    tipo: "servico",
    quantidade: 1,
    valor_unitario: 0,
  });
  
  // Collapsible sections - open by default if new OS
  const [checklistOpen, setChecklistOpen] = useState(isNewOS);
  const [fotosOpen, setFotosOpen] = useState(isNewOS);
  const [servicosOpen, setServicosOpen] = useState(isNewOS);
  const [upsellOpen, setUpsellOpen] = useState(isNewOS);
  const [checklistType, setChecklistType] = useState<'entrada' | 'dinamometro' | 'precompra'>('entrada');
  
  // Checklist states
  const [checklistEntrada, setChecklistEntrada] = useState<Record<string, boolean>>({});
  const [checklistDyno, setChecklistDyno] = useState<Record<string, boolean>>({});
  const [checklistPreCompra, setChecklistPreCompra] = useState<Record<string, boolean>>({});

  // Fetch OS data
  const { data: os, isLoading, error } = useQuery({
    queryKey: ["ordem-servico", osId],
    queryFn: async () => {
      if (!osId) throw new Error("ID não fornecido");
      
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .eq("id", osId)
        .single();

      if (error) throw error;
      return data as OrdemServico;
    },
    enabled: !!osId,
  });

  // Fetch OS items
  const { data: itens = [] } = useQuery({
    queryKey: ["ordem-servico-itens", osId],
    queryFn: async () => {
      if (!osId) return [];
      
      const { data, error } = await supabase
        .from("ordens_servico_itens")
        .select("*")
        .eq("ordem_servico_id", osId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as OrdemServicoItem[];
    },
    enabled: !!osId,
  });

  // Fetch mechanics
  const { data: mechanics = [] } = useQuery({
    queryKey: ["mechanics-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mechanics")
        .select("id, name")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Update OS mutation
  const updateOSMutation = useMutation({
    mutationFn: async (updates: Partial<OrdemServico>) => {
      const { error } = await supabase
        .from("ordens_servico")
        .update(updates)
        .eq("id", osId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordem-servico", osId] });
      toast.success("OS atualizada com sucesso!");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating OS:", error);
      toast.error("Erro ao atualizar OS");
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const valor_total = item.quantidade * item.valor_unitario;
      const { error } = await supabase
        .from("ordens_servico_itens")
        .insert([{
          ordem_servico_id: osId,
          descricao: item.descricao,
          tipo: item.tipo,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total,
          status: "pendente",
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordem-servico-itens", osId] });
      recalculateTotal();
      toast.success("Item adicionado!");
      setShowAddItemDialog(false);
      setNewItem({ descricao: "", tipo: "servico", quantidade: 1, valor_unitario: 0 });
    },
    onError: (error) => {
      console.error("Error adding item:", error);
      toast.error("Erro ao adicionar item");
    },
  });

  // Update item status mutation
  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ itemId, status, motivo_recusa }: { itemId: string; status: string; motivo_recusa?: string }) => {
      const { error } = await supabase
        .from("ordens_servico_itens")
        .update({ status, motivo_recusa: motivo_recusa || null })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordem-servico-itens", osId] });
      recalculateTotal();
      toast.success("Status do item atualizado!");
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("ordens_servico_itens")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordem-servico-itens", osId] });
      recalculateTotal();
      toast.success("Item removido!");
    },
  });

  // Recalculate totals
  const recalculateTotal = async () => {
    const { data: currentItens } = await supabase
      .from("ordens_servico_itens")
      .select("*")
      .eq("ordem_servico_id", osId);

    if (currentItens) {
      const valor_orcado = currentItens.reduce((acc, item) => acc + (item.valor_total || 0), 0);
      const valor_aprovado = currentItens
        .filter(item => item.status === "aprovado")
        .reduce((acc, item) => acc + (item.valor_total || 0), 0);

      await supabase
        .from("ordens_servico")
        .update({ valor_orcado, valor_aprovado })
        .eq("id", osId);

      queryClient.invalidateQueries({ queryKey: ["ordem-servico", osId] });
    }
  };

  useEffect(() => {
    if (os) {
      setEditedOS(os);
      // Initialize checklists from OS data
      if (os.checklist_entrada) setChecklistEntrada(os.checklist_entrada);
      if (os.checklist_dinamometro) setChecklistDyno(os.checklist_dinamometro);
      if (os.checklist_precompra) setChecklistPreCompra(os.checklist_precompra);
    }
  }, [os]);

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const handleSave = () => {
    updateOSMutation.mutate(editedOS);
  };

  const handleStatusChange = (newStatus: string) => {
    const updates: Partial<OrdemServico> = { status: newStatus };
    
    if (newStatus === "orcamento" && !os?.data_orcamento) {
      updates.data_orcamento = new Date().toISOString();
    } else if ((newStatus === "aprovado" || newStatus === "parcial") && !os?.data_aprovacao) {
      updates.data_aprovacao = new Date().toISOString();
    } else if (newStatus === "concluido" && !os?.data_conclusao) {
      updates.data_conclusao = new Date().toISOString();
    } else if (newStatus === "entregue" && !os?.data_entrega) {
      updates.data_entrega = new Date().toISOString();
    }

    updateOSMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !os) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">OS não encontrada</h2>
          <Button onClick={() => navigate("/admin/ordens-servico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const currentStatus = statusConfig[os.status] || statusConfig.orcamento;
  const StatusIcon = currentStatus.icon;

  // Calculate totals from items
  const totalOrcado = itens.reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const totalAprovado = itens
    .filter(item => item.status === "aprovado")
    .reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const totalRecusado = itens
    .filter(item => item.status === "recusado")
    .reduce((acc, item) => acc + (item.valor_total || 0), 0);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/ordens-servico")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono text-foreground">{os.numero_os}</h1>
                <Badge variant="outline" className={cn("gap-1", currentStatus.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Entrada: {formatDate(os.data_entrada)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={updateOSMutation.isPending}>
                  {updateOSMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Vehicle */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Cliente e Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.client_name || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, client_name: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium mt-1">{os.client_name || "-"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.client_phone || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, client_phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium">{os.client_phone || "-"}</p>
                        {os.client_phone && (
                          <a 
                            href={`https://wa.me/55${os.client_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Veículo</Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.vehicle || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, vehicle: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium mt-1">{os.vehicle}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Placa</Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.plate || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, plate: e.target.value.toUpperCase() })}
                      />
                    ) : (
                      <p className="font-medium font-mono mt-1">{os.plate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problem Description */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Descrição do Problema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedOS.descricao_problema || ""}
                    onChange={(e) => setEditedOS({ ...editedOS, descricao_problema: e.target.value })}
                    className="min-h-[100px]"
                    placeholder="Descreva o problema relatado..."
                  />
                ) : (
                  <p className="text-foreground whitespace-pre-wrap">
                    {os.descricao_problema || "Nenhuma descrição informada"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Checklist Section - Moved below problem description */}
            <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}>
              <Card className="bg-card/50 border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5" />
                        Checklist
                        {(Object.values(checklistEntrada).some(v => v) || 
                          Object.values(checklistDyno).some(v => v) || 
                          Object.values(checklistPreCompra).some(v => v)) && (
                          <Badge variant="secondary" className="ml-2">Preenchido</Badge>
                        )}
                      </div>
                      {checklistOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <Tabs value={checklistType} onValueChange={(v) => setChecklistType(v as 'entrada' | 'dinamometro' | 'precompra')}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="entrada" className="flex items-center gap-1 text-xs md:text-sm">
                          <ClipboardCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Entrada</span>
                        </TabsTrigger>
                        <TabsTrigger value="dinamometro" className="flex items-center gap-1 text-xs md:text-sm">
                          <Gauge className="w-4 h-4" />
                          <span className="hidden sm:inline">Dinamômetro</span>
                        </TabsTrigger>
                        <TabsTrigger value="precompra" className="flex items-center gap-1 text-xs md:text-sm">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Pré-Compra</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Checklist Entrada */}
                      <TabsContent value="entrada" className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { key: "nivelOleo", label: "Nível de Óleo" },
                            { key: "nivelAgua", label: "Nível de Água" },
                            { key: "freios", label: "Freios" },
                            { key: "pneus", label: "Pneus" },
                            { key: "luzes", label: "Luzes" },
                            { key: "bateria", label: "Bateria" },
                            { key: "correia", label: "Correia" },
                            { key: "suspensao", label: "Suspensão" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`entrada-${item.key}`}
                                checked={checklistEntrada[item.key] || false}
                                onCheckedChange={(checked) => {
                                  const updated = { ...checklistEntrada, [item.key]: checked === true };
                                  setChecklistEntrada(updated);
                                  updateOSMutation.mutate({ checklist_entrada: updated });
                                }}
                              />
                              <label htmlFor={`entrada-${item.key}`} className="text-sm font-medium leading-none cursor-pointer">
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Checklist Dinamômetro */}
                      <TabsContent value="dinamometro" className="mt-4 space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                            <Activity className="w-4 h-4" />
                            Verificações
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { key: "combustivelAdequado", label: "Combustível adequado" },
                              { key: "oleoNivel", label: "Óleo no nível correto" },
                              { key: "arrefecimentoOk", label: "Arrefecimento ok" },
                              { key: "pneusCalibrados", label: "Pneus calibrados" },
                              { key: "correiasPolias", label: "Correias e polias" },
                              { key: "escapamentoOk", label: "Escapamento ok" },
                              { key: "sensorOxigenio", label: "Sensor de oxigênio" },
                              { key: "ignioOk", label: "Sistema de ignição" },
                            ].map((item) => (
                              <div key={item.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`dyno-${item.key}`}
                                  checked={checklistDyno[item.key] || false}
                                  onCheckedChange={(checked) => {
                                    const updated = { ...checklistDyno, [item.key]: checked === true };
                                    setChecklistDyno(updated);
                                    updateOSMutation.mutate({ checklist_dinamometro: updated });
                                  }}
                                />
                                <label htmlFor={`dyno-${item.key}`} className="text-sm cursor-pointer">
                                  {item.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Checklist Pré-Compra */}
                      <TabsContent value="precompra" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { key: "documentacao", label: "Documentação em dia" },
                            { key: "pintura", label: "Pintura original" },
                            { key: "motor", label: "Motor ok" },
                            { key: "cambio", label: "Câmbio ok" },
                            { key: "suspensao", label: "Suspensão ok" },
                            { key: "freios", label: "Freios ok" },
                            { key: "eletrica", label: "Parte elétrica" },
                            { key: "estrutura", label: "Estrutura íntegra" },
                            { key: "historico", label: "Histórico limpo" },
                            { key: "sinistro", label: "Sem sinistro" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`precompra-${item.key}`}
                                checked={checklistPreCompra[item.key] || false}
                                onCheckedChange={(checked) => {
                                  const updated = { ...checklistPreCompra, [item.key]: checked === true };
                                  setChecklistPreCompra(updated);
                                  updateOSMutation.mutate({ checklist_precompra: updated });
                                }}
                              />
                              <label htmlFor={`precompra-${item.key}`} className="text-sm cursor-pointer">
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Fotos e Vídeos Section - Between Checklist and Diagnosis */}
            <Collapsible open={fotosOpen} onOpenChange={setFotosOpen}>
              <Card className="bg-card/50 border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Fotos e Vídeos
                        {os.fotos_entrada && os.fotos_entrada.length > 0 && (
                          <Badge variant="secondary" className="ml-2">{os.fotos_entrada.length} arquivos</Badge>
                        )}
                      </div>
                      {fotosOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {/* Upload buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Camera className="w-4 h-4" />
                        Adicionar Foto
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Video className="w-4 h-4" />
                        Adicionar Vídeo
                      </Button>
                    </div>
                    
                    {os.fotos_entrada && os.fotos_entrada.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {os.fotos_entrada.map((foto, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                            <img
                              src={foto}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(foto, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma foto ou vídeo registrado</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Diagnosis - After Fotos/Videos */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5" />
                  Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedOS.diagnostico || ""}
                    onChange={(e) => setEditedOS({ ...editedOS, diagnostico: e.target.value })}
                    className="min-h-[100px]"
                    placeholder="Diagnóstico técnico..."
                  />
                ) : (
                  <p className="text-foreground whitespace-pre-wrap">
                    {os.diagnostico || "Aguardando diagnóstico"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* AI Proactive Sales Assistant - Internal Only */}
            <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Assistente de Vendas IA
                  <Badge variant="outline" className="ml-auto bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs">
                    Interno
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Cashback incentive */}
                {(() => {
                  const currentTotal = totalAprovado || totalOrcado || 0;
                  const nextTier = currentTotal < 500 ? 500 : currentTotal < 1000 ? 1000 : currentTotal < 2000 ? 2000 : 5000;
                  const remaining = nextTier - currentTotal;
                  const cashbackPercent = nextTier >= 2000 ? 10 : nextTier >= 1000 ? 7 : 5;
                  
                  if (remaining > 0 && remaining < nextTier) {
                    return (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-700 text-sm">Oportunidade de Cashback!</span>
                        </div>
                        <p className="text-sm text-foreground">
                          Faltam apenas <strong className="text-green-600">{formatCurrency(remaining)}</strong> para o cliente ganhar{" "}
                          <strong className="text-green-600">{cashbackPercent}% de cashback</strong> na próxima visita!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Sugira: troca de filtros, alinhamento, ou revisão de ar-condicionado
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Upsell suggestions based on vehicle/km */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-700 text-sm">Sugestões de Venda</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm p-2 bg-background/50 rounded">
                      <span>Higienização do A/C</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">R$ 189</span>
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                          setNewItem({ descricao: "Higienização do Ar Condicionado", tipo: "servico", quantidade: 1, valor_unitario: 189 });
                          setShowAddItemDialog(true);
                        }}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-background/50 rounded">
                      <span>Limpeza de Bicos</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">R$ 280</span>
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                          setNewItem({ descricao: "Limpeza de Bicos Injetores", tipo: "servico", quantidade: 1, valor_unitario: 280 });
                          setShowAddItemDialog(true);
                        }}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-background/50 rounded">
                      <span>Cristalização de Faróis</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">R$ 150</span>
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                          setNewItem({ descricao: "Cristalização de Faróis", tipo: "servico", quantidade: 1, valor_unitario: 150 });
                          setShowAddItemDialog(true);
                        }}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setShowCalculator(true)}
                  >
                    <Calculator className="w-4 h-4" />
                    Calculadora
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => {
                      toast.info("Funcionalidade em desenvolvimento");
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Simular Desconto
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items / Budget - Serviços e Peças */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Itens do Orçamento
                </CardTitle>
                <Button size="sm" onClick={() => setShowAddItemDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent>
                {itens.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum item adicionado ao orçamento</p>
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => setShowAddItemDialog(true)}
                    >
                      Adicionar primeiro item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Serviços Section */}
                    {itens.filter(i => i.tipo === "servico").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <Wrench className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm text-primary">SERVIÇOS</h4>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {itens.filter(i => i.tipo === "servico").length} itens
                          </Badge>
                        </div>
                        {itens.filter(i => i.tipo === "servico").map((item) => {
                          const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-start justify-between p-4 rounded-lg border",
                                item.status === "recusado" && "bg-red-500/5 border-red-500/20",
                                item.status === "aprovado" && "bg-green-500/5 border-green-500/20"
                              )}
                            >
                              <div className="flex-1 space-y-1">
                                <span className="font-medium">{item.descricao}</span>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantidade}x {formatCurrency(item.valor_unitario)} = {formatCurrency(item.valor_total)}
                                </div>
                                {item.motivo_recusa && (
                                  <p className="text-sm text-red-600">Motivo: {item.motivo_recusa}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={item.status}
                                  onValueChange={(value) => {
                                    if (value === "recusado") {
                                      const motivo = prompt("Motivo da recusa:");
                                      updateItemStatusMutation.mutate({ 
                                        itemId: item.id, 
                                        status: value,
                                        motivo_recusa: motivo || undefined
                                      });
                                    } else {
                                      updateItemStatusMutation.mutate({ itemId: item.id, status: value });
                                    }
                                  }}
                                >
                                  <SelectTrigger className={cn("w-32", itemStatus.color)}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="aprovado">Aprovado</SelectItem>
                                    <SelectItem value="recusado">Recusado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remover item?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteItemMutation.mutate(item.id)}
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          );
                        })}
                        {/* Subtotal Serviços */}
                        <div className="flex justify-between text-sm px-4 py-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Subtotal Serviços:</span>
                          <span className="font-medium">
                            {formatCurrency(itens.filter(i => i.tipo === "servico").reduce((acc, item) => acc + (item.valor_total || 0), 0))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Peças Section */}
                    {itens.filter(i => i.tipo === "peca").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <Car className="w-4 h-4 text-orange-500" />
                          <h4 className="font-semibold text-sm text-orange-600">PEÇAS</h4>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {itens.filter(i => i.tipo === "peca").length} itens
                          </Badge>
                        </div>
                        {itens.filter(i => i.tipo === "peca").map((item) => {
                          const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-start justify-between p-4 rounded-lg border",
                                item.status === "recusado" && "bg-red-500/5 border-red-500/20",
                                item.status === "aprovado" && "bg-green-500/5 border-green-500/20"
                              )}
                            >
                              <div className="flex-1 space-y-1">
                                <span className="font-medium">{item.descricao}</span>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantidade}x {formatCurrency(item.valor_unitario)} = {formatCurrency(item.valor_total)}
                                </div>
                                {item.motivo_recusa && (
                                  <p className="text-sm text-red-600">Motivo: {item.motivo_recusa}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={item.status}
                                  onValueChange={(value) => {
                                    if (value === "recusado") {
                                      const motivo = prompt("Motivo da recusa:");
                                      updateItemStatusMutation.mutate({ 
                                        itemId: item.id, 
                                        status: value,
                                        motivo_recusa: motivo || undefined
                                      });
                                    } else {
                                      updateItemStatusMutation.mutate({ itemId: item.id, status: value });
                                    }
                                  }}
                                >
                                  <SelectTrigger className={cn("w-32", itemStatus.color)}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="aprovado">Aprovado</SelectItem>
                                    <SelectItem value="recusado">Recusado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remover item?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteItemMutation.mutate(item.id)}
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          );
                        })}
                        {/* Subtotal Peças */}
                        <div className="flex justify-between text-sm px-4 py-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Subtotal Peças:</span>
                          <span className="font-medium">
                            {formatCurrency(itens.filter(i => i.tipo === "peca").reduce((acc, item) => acc + (item.valor_total || 0), 0))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Grand Totals */}
                    <div className="border-t-2 border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Orçado:</span>
                        <span className="font-semibold">{formatCurrency(totalOrcado)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Total Aprovado:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(totalAprovado)}</span>
                      </div>
                      {totalRecusado > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Total Recusado:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(totalRecusado)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Values Summary - Moved to top */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orçado:</span>
                  <span className="font-medium">{formatCurrency(totalOrcado || os.valor_orcado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Aprovado:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalAprovado || os.valor_aprovado)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Final:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editedOS.valor_final || 0}
                        onChange={(e) => setEditedOS({ ...editedOS, valor_final: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <span className="font-bold text-lg">{formatCurrency(os.valor_final)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Status da OS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={os.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className={cn(currentStatus.color)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                    <SelectItem value="orcamento">Orçamento</SelectItem>
                    <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="parcial">Parcialmente Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mechanic assignment */}
                <div className="space-y-2">
                  <Label>Mecânico Responsável</Label>
                  <Select
                    value={os.mechanic_id || "none"}
                    onValueChange={(value) => {
                      updateOSMutation.mutate({ mechanic_id: value === "none" ? null : value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar mecânico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não atribuído</SelectItem>
                      {mechanics.map((mec) => (
                        <SelectItem key={mec.id} value={mec.id}>
                          {mec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dates Card */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrada:</span>
                  <span>{formatDate(os.data_entrada)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orçamento:</span>
                  <span>{formatDate(os.data_orcamento)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aprovação:</span>
                  <span>{formatDate(os.data_aprovacao)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conclusão:</span>
                  <span>{formatDate(os.data_conclusao)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrega:</span>
                  <span>{formatDate(os.data_entrega)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedOS.observacoes || ""}
                    onChange={(e) => setEditedOS({ ...editedOS, observacoes: e.target.value })}
                    placeholder="Observações internas..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {os.observacoes || "Nenhuma observação"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newItem.tipo}
                onValueChange={(value) => setNewItem({ ...newItem, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="peca">Peça</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={newItem.descricao}
                onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                placeholder="Ex: Troca de óleo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem({ ...newItem, quantidade: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Unitário (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newItem.valor_unitario}
                  onChange={(e) => setNewItem({ ...newItem, valor_unitario: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">{formatCurrency(newItem.quantidade * newItem.valor_unitario)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => addItemMutation.mutate(newItem)}
              disabled={!newItem.descricao.trim() || addItemMutation.isPending}
            >
              {addItemMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculadora Rápida
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground text-sm mb-2">Calculadora em desenvolvimento</p>
              <p className="text-2xl font-mono font-bold">0.00</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map((key) => (
                <Button 
                  key={key} 
                  variant={['÷', '×', '-', '+', '='].includes(key) ? 'default' : 'outline'}
                  className="h-12 text-lg font-medium"
                  onClick={() => toast.info("Calculadora em desenvolvimento")}
                >
                  {key}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => toast.info("Limpar")}>
                C
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => toast.info("Backspace")}>
                ⌫
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalculator(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
