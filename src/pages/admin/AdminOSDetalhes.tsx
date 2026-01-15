import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Save, Plus, Trash2, Phone, Car, User, 
  Calendar, DollarSign, FileText, Wrench, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, Edit2,
  ClipboardCheck, Camera, ChevronDown, ChevronUp, Gauge, ShieldCheck, Activity, Image,
  TrendingUp, Sparkles, Calculator, Gift, Video, Zap, Link, Send, Download,
  MessageSquare, Crown, Award, Medal, Star, Scan
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
  valor_custo: number | null;
  valor_venda_sugerido: number | null;
  margem_aplicada: number | null;
  justificativa_desconto: string | null;
  prioridade: 'verde' | 'amarelo' | 'vermelho' | null;
  data_retorno_estimada: string | null;
}

// Configuração de prioridade/criticidade
const prioridadeConfig: Record<string, { label: string; borderColor: string; bgColor: string }> = {
  verde: { label: "Tranquilo", borderColor: "border-green-500", bgColor: "bg-green-500/5" },
  amarelo: { label: "Médio", borderColor: "border-yellow-500", bgColor: "bg-yellow-500/5" },
  vermelho: { label: "Imediato", borderColor: "border-red-500", bgColor: "bg-red-500/5" },
};

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
  google_drive_link?: string | null;
  scanner_avarias?: string | null;
  enviado_gestao?: boolean;
  enviado_gestao_em?: string | null;
  remarketing_status?: string;
  remarketing_data_prevista?: string | null;
}

const loyaltyBadgeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  bronze: { label: "Bronze", color: "bg-amber-700/20 text-amber-700 border-amber-700/30", icon: Medal },
  prata: { label: "Prata", color: "bg-slate-400/20 text-slate-500 border-slate-400/30", icon: Award },
  ouro: { label: "Ouro", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30", icon: Crown },
  diamante: { label: "Diamante", color: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30", icon: Star },
};

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
  const [showAddMaoDeObraDialog, setShowAddMaoDeObraDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [newItem, setNewItem] = useState({
    descricao: "",
    tipo: "peca",
    quantidade: 1,
    valor_custo: 0,
    margem: 40,
    valor_unitario: 0,
    prioridade: "amarelo" as 'verde' | 'amarelo' | 'vermelho',
    data_retorno_estimada: "",
  });
  const [newMaoDeObra, setNewMaoDeObra] = useState({
    descricao: "",
    quantidade: 1,
    valor_unitario: 0,
    prioridade: "amarelo" as 'verde' | 'amarelo' | 'vermelho',
    data_retorno_estimada: "",
  });
  const [showJustificativaDialog, setShowJustificativaDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<typeof newItem | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const MARGEM_MINIMA = 40; // Margem mínima de 40% definida pela gestão
  
  // Collapsible sections - open by default if new OS
  const [checklistOpen, setChecklistOpen] = useState(isNewOS);
  const [fotosOpen, setFotosOpen] = useState(isNewOS);
  const [servicosOpen, setServicosOpen] = useState(isNewOS);
  const [upsellOpen, setUpsellOpen] = useState(isNewOS);
  const [checklistType, setChecklistType] = useState<'entrada' | 'dinamometro' | 'precompra' | 'geral'>('entrada');
  
  // Google Drive link and scanner
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [scannerAvarias, setScannerAvarias] = useState("");
  
  // Client loyalty level - fetched from profile
  const [clientLoyaltyLevel, setClientLoyaltyLevel] = useState<'bronze' | 'prata' | 'ouro' | 'diamante'>('bronze');
  
  // Checklist states
  const [checklistEntrada, setChecklistEntrada] = useState<Record<string, boolean>>({});
  const [checklistDyno, setChecklistDyno] = useState<Record<string, boolean>>({});
  const [checklistPreCompra, setChecklistPreCompra] = useState<Record<string, boolean>>({});
  const [checklistGeral, setChecklistGeral] = useState<Record<string, boolean>>({});

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

  // Add item mutation (peças)
  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem & { justificativa?: string }) => {
      const valor_venda_sugerido = item.valor_custo * (1 + item.margem / 100) * item.quantidade;
      const valor_total = item.valor_unitario * item.quantidade;
      const margem_real = item.valor_custo > 0 
        ? ((item.valor_unitario - item.valor_custo) / item.valor_custo) * 100 
        : item.margem;
      
      const { error } = await supabase
        .from("ordens_servico_itens")
        .insert([{
          ordem_servico_id: osId,
          descricao: item.descricao,
          tipo: item.tipo,
          quantidade: item.quantidade,
          valor_custo: item.valor_custo,
          valor_venda_sugerido: valor_venda_sugerido,
          valor_unitario: item.valor_unitario,
          valor_total,
          margem_aplicada: margem_real,
          justificativa_desconto: item.justificativa || null,
          status: "pendente",
          prioridade: item.prioridade,
          data_retorno_estimada: item.data_retorno_estimada || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordem-servico-itens", osId] });
      recalculateTotal();
      toast.success("Item adicionado!");
      setShowAddItemDialog(false);
      setNewItem({ descricao: "", tipo: "peca", quantidade: 1, valor_custo: 0, margem: 40, valor_unitario: 0, prioridade: "amarelo", data_retorno_estimada: "" });
      setJustificativa("");
      setPendingItem(null);
    },
    onError: (error) => {
      console.error("Error adding item:", error);
      toast.error("Erro ao adicionar item");
    },
  });

  // Add mão de obra mutation (sem custo)
  const addMaoDeObraMutation = useMutation({
    mutationFn: async (item: typeof newMaoDeObra) => {
      const valor_total = item.valor_unitario * item.quantidade;
      
      const { error } = await supabase
        .from("ordens_servico_itens")
        .insert([{
          ordem_servico_id: osId,
          descricao: item.descricao,
          tipo: "mao_de_obra",
          quantidade: item.quantidade,
          valor_custo: 0,
          valor_venda_sugerido: item.valor_unitario,
          valor_unitario: item.valor_unitario,
          valor_total,
          margem_aplicada: 100,
          status: "pendente",
          prioridade: item.prioridade,
          data_retorno_estimada: item.data_retorno_estimada || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordem-servico-itens", osId] });
      recalculateTotal();
      toast.success("Mão de obra adicionada!");
      setShowAddMaoDeObraDialog(false);
      setNewMaoDeObra({ descricao: "", quantidade: 1, valor_unitario: 0, prioridade: "amarelo", data_retorno_estimada: "" });
    },
    onError: (error) => {
      console.error("Error adding mão de obra:", error);
      toast.error("Erro ao adicionar mão de obra");
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
      // @ts-ignore - fields may not exist yet
      if (os.google_drive_link) setGoogleDriveLink(os.google_drive_link);
      // @ts-ignore
      if (os.scanner_avarias) setScannerAvarias(os.scanner_avarias);
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
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Cliente e Veículo
                  </div>
                  {/* Loyalty Badge */}
                  {(() => {
                    const loyalty = loyaltyBadgeConfig[clientLoyaltyLevel];
                    const LoyaltyIcon = loyalty.icon;
                    return (
                      <Badge variant="outline" className={cn("gap-1.5 px-3 py-1", loyalty.color)}>
                        <LoyaltyIcon className="w-4 h-4" />
                        {loyalty.label}
                      </Badge>
                    );
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <Label className="text-muted-foreground flex items-center gap-1">
                      KM Atual <span className="text-red-500">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.km_atual || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, km_atual: e.target.value })}
                        placeholder="Ex: 45.000"
                        className={cn(!os.km_atual && "border-red-500/50")}
                      />
                    ) : (
                      <p className={cn(
                        "font-medium font-mono mt-1",
                        !os.km_atual && "text-red-500"
                      )}>
                        {os.km_atual ? `${os.km_atual} km` : "⚠️ Não informado"}
                      </p>
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
                    <Tabs value={checklistType} onValueChange={(v) => setChecklistType(v as 'entrada' | 'dinamometro' | 'precompra' | 'geral')}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="entrada" className="flex items-center gap-1 text-xs">
                          <ClipboardCheck className="w-3 h-3" />
                          <span className="hidden sm:inline">Entrada</span>
                        </TabsTrigger>
                        <TabsTrigger value="dinamometro" className="flex items-center gap-1 text-xs">
                          <Gauge className="w-3 h-3" />
                          <span className="hidden sm:inline">Dyno</span>
                        </TabsTrigger>
                        <TabsTrigger value="precompra" className="flex items-center gap-1 text-xs">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="hidden sm:inline">Pré-Compra</span>
                        </TabsTrigger>
                        <TabsTrigger value="geral" className="flex items-center gap-1 text-xs">
                          <FileText className="w-3 h-3" />
                          <span className="hidden sm:inline">Geral</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Checklist Entrada - Com itens obrigatórios */}
                      <TabsContent value="entrada" className="mt-4 space-y-4">
                        {/* Itens Obrigatórios */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            Obrigatórios
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                            {[
                              { key: "nivelOleo", label: "Nível de Óleo" },
                              { key: "nivelAgua", label: "Nível de Água" },
                              { key: "freios", label: "Freios" },
                              { key: "kmAtual", label: "KM Atual Registrado" },
                            ].map((item) => (
                              <div key={item.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`entrada-obr-${item.key}`}
                                  checked={checklistEntrada[item.key] || false}
                                  onCheckedChange={(checked) => {
                                    const updated = { ...checklistEntrada, [item.key]: checked === true };
                                    setChecklistEntrada(updated);
                                    updateOSMutation.mutate({ checklist_entrada: updated });
                                  }}
                                />
                                <label htmlFor={`entrada-obr-${item.key}`} className="text-sm font-medium leading-none cursor-pointer">
                                  {item.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Itens Opcionais */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground">Verificações Adicionais</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { key: "pneus", label: "Pneus" },
                              { key: "luzes", label: "Luzes" },
                              { key: "bateria", label: "Bateria" },
                              { key: "correia", label: "Correia" },
                              { key: "suspensao", label: "Suspensão" },
                              { key: "limpadores", label: "Limpadores" },
                              { key: "arCondicionado", label: "Ar Condicionado" },
                              { key: "vidros", label: "Vidros" },
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
                                <label htmlFor={`entrada-${item.key}`} className="text-sm leading-none cursor-pointer">
                                  {item.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Scanner / Códigos de Erro */}
                        <div className="space-y-3 pt-4 border-t border-border">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                            <Scan className="w-4 h-4" />
                            Scanner / Códigos de Erro
                          </h4>
                          {isEditing ? (
                            <Textarea
                              value={scannerAvarias}
                              onChange={(e) => setScannerAvarias(e.target.value)}
                              placeholder="Códigos de erro do scanner (ex: P0300, P0171)..."
                              className="min-h-[80px]"
                            />
                          ) : (
                            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg min-h-[60px]">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {scannerAvarias || "Nenhum código registrado"}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Checklist Dinamômetro */}
                      <TabsContent value="dinamometro" className="mt-4 space-y-4">
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

                      {/* Checklist Geral - Com muitos itens opcionais */}
                      <TabsContent value="geral" className="mt-4 space-y-4">
                        <p className="text-xs text-muted-foreground">Verificações completas para inspeção detalhada</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { key: "parabrisa", label: "Parabrisa" },
                            { key: "retrovisores", label: "Retrovisores" },
                            { key: "cintos", label: "Cintos de segurança" },
                            { key: "airbag", label: "Indicador Airbag" },
                            { key: "buzina", label: "Buzina" },
                            { key: "travaPortas", label: "Trava das portas" },
                            { key: "vidrosEletricos", label: "Vidros elétricos" },
                            { key: "bancosAjuste", label: "Ajuste dos bancos" },
                            { key: "arCondicionadoFunc", label: "Funcionamento A/C" },
                            { key: "aquecedor", label: "Aquecedor" },
                            { key: "radioSom", label: "Rádio/Som" },
                            { key: "painel", label: "Painel de instrumentos" },
                            { key: "volanteFolga", label: "Folga do volante" },
                            { key: "pedais", label: "Pedais" },
                            { key: "freioMao", label: "Freio de mão" },
                            { key: "cambioFunc", label: "Funcionamento câmbio" },
                            { key: "embreagem", label: "Embreagem" },
                            { key: "partidaMotor", label: "Partida do motor" },
                            { key: "marcha", label: "Marcha lenta" },
                            { key: "aceleracao", label: "Aceleração" },
                            { key: "escapamento", label: "Escapamento" },
                            { key: "direcao", label: "Direção" },
                            { key: "amortecedores", label: "Amortecedores" },
                            { key: "pneuEstepe", label: "Pneu estepe" },
                            { key: "ferramentas", label: "Ferramentas" },
                            { key: "triangulo", label: "Triângulo" },
                            { key: "macaco", label: "Macaco" },
                            { key: "chaveRodas", label: "Chave de rodas" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`geral-${item.key}`}
                                checked={checklistGeral[item.key] || false}
                                onCheckedChange={(checked) => {
                                  const updated = { ...checklistGeral, [item.key]: checked === true };
                                  setChecklistGeral(updated);
                                  // Save to a general checklist field if needed
                                }}
                              />
                              <label htmlFor={`geral-${item.key}`} className="text-sm cursor-pointer">
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

            {/* Fotos e Vídeos Section - With Google Drive Link */}
            <Collapsible open={fotosOpen} onOpenChange={setFotosOpen}>
              <Card className="bg-card/50 border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Fotos e Vídeos
                        {googleDriveLink && (
                          <Badge variant="secondary" className="ml-2 gap-1">
                            <Link className="w-3 h-3" />
                            Link
                          </Badge>
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
                    {/* Google Drive Link */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        <Link className="w-4 h-4" />
                        Link do Google Drive (Fotos/Vídeos)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={googleDriveLink}
                          onChange={(e) => setGoogleDriveLink(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="flex-1"
                        />
                        {googleDriveLink && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => window.open(googleDriveLink, '_blank')}
                          >
                            <Link className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cole o link da pasta do Google Drive para manter as fotos e vídeos organizados
                      </p>
                    </div>

                    {googleDriveLink ? (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Pasta do Google Drive</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {googleDriveLink}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => window.open(googleDriveLink, '_blank')}
                            className="gap-2"
                          >
                            <Link className="w-4 h-4" />
                            Abrir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                        <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Adicione o link do Google Drive</p>
                        <p className="text-xs">As fotos ficam no Drive para não pesar a página</p>
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

            {/* Items / Budget - Serviços e Peças */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Itens do Orçamento
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAddMaoDeObraDialog(true)}>
                    <Wrench className="w-4 h-4 mr-2" />
                    Mão de Obra
                  </Button>
                  <Button size="sm" onClick={() => setShowAddItemDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Item (Peça)
                  </Button>
                </div>
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
                    {/* Mão de Obra Section */}
                    {itens.filter(i => i.tipo === "servico" || i.tipo === "mao_de_obra").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <Wrench className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm text-primary">MÃO DE OBRA</h4>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {itens.filter(i => i.tipo === "servico" || i.tipo === "mao_de_obra").length} itens
                          </Badge>
                        </div>
                        {itens.filter(i => i.tipo === "servico" || i.tipo === "mao_de_obra").map((item) => {
                          const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;
                          const prioridadeCfg = prioridadeConfig[item.prioridade || 'amarelo'];
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-start justify-between p-4 rounded-lg border-2",
                                prioridadeCfg.borderColor,
                                prioridadeCfg.bgColor,
                                item.status === "recusado" && "opacity-60"
                              )}
                            >
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.descricao}</span>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-1.5",
                                    item.prioridade === 'vermelho' && "border-red-500 text-red-600",
                                    item.prioridade === 'amarelo' && "border-yellow-500 text-yellow-600",
                                    item.prioridade === 'verde' && "border-green-500 text-green-600"
                                  )}>
                                    {prioridadeCfg.label}
                                  </Badge>
                                </div>
                                <div className="text-sm font-medium">
                                  {item.quantidade}x {formatCurrency(item.valor_unitario)} = {formatCurrency(item.valor_total)}
                                </div>
                                {item.data_retorno_estimada && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Retorno: {format(new Date(item.data_retorno_estimada), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                )}
                                {item.justificativa_desconto && (
                                  <p className="text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                                    💬 {item.justificativa_desconto}
                                  </p>
                                )}
                                {item.motivo_recusa && (
                                  <p className="text-sm text-red-600">Motivo recusa: {item.motivo_recusa}</p>
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
                        {/* Subtotal Mão de Obra */}
                        <div className="flex justify-between text-sm px-4 py-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Subtotal Mão de Obra:</span>
                          <span className="font-medium">
                            {formatCurrency(itens.filter(i => i.tipo === "servico" || i.tipo === "mao_de_obra").reduce((acc, item) => acc + (item.valor_total || 0), 0))}
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
                          const prioridadeCfg = prioridadeConfig[item.prioridade || 'amarelo'];
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-start justify-between p-4 rounded-lg border-2",
                                prioridadeCfg.borderColor,
                                prioridadeCfg.bgColor,
                                item.status === "recusado" && "opacity-60"
                              )}
                            >
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.descricao}</span>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-1.5",
                                    item.prioridade === 'vermelho' && "border-red-500 text-red-600",
                                    item.prioridade === 'amarelo' && "border-yellow-500 text-yellow-600",
                                    item.prioridade === 'verde' && "border-green-500 text-green-600"
                                  )}>
                                    {prioridadeCfg.label}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                  <span>Custo: {formatCurrency(item.valor_custo || 0)}</span>
                                  <span>Venda: {formatCurrency(item.valor_unitario)}</span>
                                  <span className={cn(
                                    "font-medium",
                                    (item.margem_aplicada || 0) < MARGEM_MINIMA ? "text-red-600" : "text-green-600"
                                  )}>
                                    Margem: {(item.margem_aplicada || 0).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="text-sm font-medium">
                                  {item.quantidade}x {formatCurrency(item.valor_unitario)} = {formatCurrency(item.valor_total)}
                                </div>
                                {item.data_retorno_estimada && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Retorno: {format(new Date(item.data_retorno_estimada), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                )}
                                {item.justificativa_desconto && (
                                  <p className="text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                                    💬 {item.justificativa_desconto}
                                  </p>
                                )}
                                {item.motivo_recusa && (
                                  <p className="text-sm text-red-600">Motivo recusa: {item.motivo_recusa}</p>
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
          <div className="space-y-4">
            {/* Status Card */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status da OS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="space-y-1">
                  <Label className="text-xs">Mecânico</Label>
                  <Select
                    value={os.mechanic_id || "none"}
                    onValueChange={(value) => {
                      updateOSMutation.mutate({ mechanic_id: value === "none" ? null : value });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar" />
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

            {/* Dates Card - Compact */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entrada:</span>
                  <span>{formatDate(os.data_entrada)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Orçamento:</span>
                  <span>{formatDate(os.data_orcamento)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Aprovação:</span>
                  <span>{formatDate(os.data_aprovacao)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Conclusão:</span>
                  <span>{formatDate(os.data_conclusao)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entrega:</span>
                  <span>{formatDate(os.data_entrega)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Observations - Compact */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedOS.observacoes || ""}
                    onChange={(e) => setEditedOS({ ...editedOS, observacoes: e.target.value })}
                    placeholder="Observações internas..."
                    className="min-h-[60px] text-sm"
                  />
                ) : (
                  <p className="text-xs text-foreground whitespace-pre-wrap">
                    {os.observacoes || "Nenhuma observação"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* AI Sales Assistant - Compact */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Assistente IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Cashback hint */}
                {(() => {
                  const currentTotal = totalAprovado || totalOrcado || 0;
                  const nextTier = currentTotal < 500 ? 500 : currentTotal < 1000 ? 1000 : currentTotal < 2000 ? 2000 : 5000;
                  const remaining = nextTier - currentTotal;
                  const cashbackPercent = nextTier >= 2000 ? 10 : nextTier >= 1000 ? 7 : 5;
                  
                  if (remaining > 0 && remaining < nextTier) {
                    return (
                      <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                        <p className="text-xs">
                          <Gift className="w-3 h-3 inline mr-1 text-green-600" />
                          Faltam <strong className="text-green-600">{formatCurrency(remaining)}</strong> para {cashbackPercent}% cashback
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Quick suggestions */}
                <div className="space-y-1">
                  {[
                    { desc: "Higienização A/C", custo: 80, venda: 189 },
                    { desc: "Limpeza de Bicos", custo: 120, venda: 280 },
                    { desc: "Cristalização Faróis", custo: 60, venda: 150 },
                  ].map((sug) => (
                    <div key={sug.desc} className="flex items-center justify-between text-xs p-1.5 bg-background/50 rounded">
                      <span className="truncate">{sug.desc}</span>
                      <Button size="sm" variant="ghost" className="h-5 px-2 text-xs" onClick={() => {
                        const margem = ((sug.venda - sug.custo) / sug.custo) * 100;
                        setNewMaoDeObra({ descricao: sug.desc, quantidade: 1, valor_unitario: sug.venda, prioridade: "amarelo", data_retorno_estimada: "" });
                        setShowAddMaoDeObraDialog(true);
                      }}>
                        +R${sug.venda}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Values + Tools */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orçado:</span>
                    <span className="font-medium">{formatCurrency(totalOrcado || os.valor_orcado)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Aprovado:</span>
                    <span className="font-medium text-green-600">{formatCurrency(totalAprovado || os.valor_aprovado)}</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Final:</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-28 h-8 text-right text-sm"
                          value={editedOS.valor_final || 0}
                          onChange={(e) => setEditedOS({ ...editedOS, valor_final: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <span className="font-bold text-lg">{formatCurrency(os.valor_final)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calculator and Discount buttons */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={() => setShowCalculator(true)}
                  >
                    <Calculator className="w-3 h-3" />
                    Calculadora
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                  >
                    <Zap className="w-3 h-3" />
                    Desconto
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enviar Orçamento */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="w-4 h-4" />
                  Enviar Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    const phone = os.client_phone?.replace(/\D/g, '');
                    if (phone) {
                      const message = encodeURIComponent(
                        `Olá ${os.client_name || 'Cliente'}! 🚗\n\nSeu orçamento está pronto!\n\nOS: ${os.numero_os}\nVeículo: ${os.vehicle} - ${os.plate}\nValor Total: ${formatCurrency(totalOrcado)}\n\nPodemos prosseguir?`
                      );
                      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
                    } else {
                      toast.error("Telefone do cliente não informado");
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  Enviar por WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => toast.info("Orçamento enviado pelo sistema")}
                >
                  <Send className="w-4 h-4 text-blue-600" />
                  Enviar pelo Sistema
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => toast.info("Gerando PDF para download...")}
                >
                  <Download className="w-4 h-4 text-purple-600" />
                  Baixar PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Dialog (Peças) */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-orange-500" />
              Adicionar Peça
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={newItem.descricao}
                onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                placeholder="Ex: Pastilha de freio dianteira"
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
                <Label>Criticidade</Label>
                <Select
                  value={newItem.prioridade}
                  onValueChange={(value: 'verde' | 'amarelo' | 'vermelho') => setNewItem({ ...newItem, prioridade: value })}
                >
                  <SelectTrigger className={cn(
                    "border-2",
                    newItem.prioridade === 'vermelho' && "border-red-500",
                    newItem.prioridade === 'amarelo' && "border-yellow-500",
                    newItem.prioridade === 'verde' && "border-green-500"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vermelho">🔴 Imediato (Urgente)</SelectItem>
                    <SelectItem value="amarelo">🟡 Médio</SelectItem>
                    <SelectItem value="verde">🟢 Tranquilo (Precaução)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Custo (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newItem.valor_custo}
                  onChange={(e) => {
                    const custo = parseFloat(e.target.value) || 0;
                    const vendaSugerida = custo * (1 + newItem.margem / 100);
                    setNewItem({ 
                      ...newItem, 
                      valor_custo: custo,
                      valor_unitario: vendaSugerida
                    });
                  }}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Margem (%)</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={newItem.margem}
                  onChange={(e) => {
                    const margem = parseFloat(e.target.value) || 0;
                    const vendaSugerida = newItem.valor_custo * (1 + margem / 100);
                    setNewItem({ 
                      ...newItem, 
                      margem,
                      valor_unitario: vendaSugerida
                    });
                  }}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Venda Final (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newItem.valor_unitario}
                  onChange={(e) => {
                    const venda = parseFloat(e.target.value) || 0;
                    const margemReal = newItem.valor_custo > 0 
                      ? ((venda - newItem.valor_custo) / newItem.valor_custo) * 100 
                      : newItem.margem;
                    setNewItem({ ...newItem, valor_unitario: venda, margem: margemReal });
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Margin indicator */}
            {newItem.valor_custo > 0 && (
              <div className={cn(
                "p-3 rounded-lg border text-sm",
                newItem.margem < MARGEM_MINIMA 
                  ? "bg-red-500/10 border-red-500/30 text-red-700" 
                  : "bg-green-500/10 border-green-500/30 text-green-700"
              )}>
                <div className="flex items-center justify-between">
                  <span>Margem aplicada:</span>
                  <span className="font-bold">{newItem.margem.toFixed(1)}%</span>
                </div>
                {newItem.margem < MARGEM_MINIMA && (
                  <p className="text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Abaixo da margem mínima ({MARGEM_MINIMA}%) - justificativa necessária
                  </p>
                )}
              </div>
            )}

            {/* Data de Retorno - obrigatória se prioridade for vermelho/amarelo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Retorno Estimada
                {newItem.prioridade !== 'verde' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="date"
                value={newItem.data_retorno_estimada}
                onChange={(e) => setNewItem({ ...newItem, data_retorno_estimada: e.target.value })}
                className={cn(
                  newItem.prioridade !== 'verde' && !newItem.data_retorno_estimada && "border-red-500/50"
                )}
              />
              <p className="text-xs text-muted-foreground">
                Data estimada para retorno do cliente (se não aprovar agora)
              </p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sugerido:</span>
                <span>{formatCurrency(newItem.valor_custo * (1 + 40 / 100) * newItem.quantidade)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Final:</span>
                <span className="text-lg">{formatCurrency(newItem.quantidade * newItem.valor_unitario)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (newItem.margem < MARGEM_MINIMA && newItem.valor_custo > 0) {
                  setPendingItem(newItem);
                  setShowJustificativaDialog(true);
                } else {
                  addItemMutation.mutate(newItem);
                }
              }}
              disabled={!newItem.descricao.trim() || addItemMutation.isPending || (newItem.prioridade !== 'verde' && !newItem.data_retorno_estimada)}
            >
              {addItemMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Adicionar Peça
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Mão de Obra Dialog */}
      <Dialog open={showAddMaoDeObraDialog} onOpenChange={setShowAddMaoDeObraDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Adicionar Mão de Obra
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={newMaoDeObra.descricao}
                onChange={(e) => setNewMaoDeObra({ ...newMaoDeObra, descricao: e.target.value })}
                placeholder="Ex: Troca de pastilhas de freio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={newMaoDeObra.quantidade}
                  onChange={(e) => setNewMaoDeObra({ ...newMaoDeObra, quantidade: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newMaoDeObra.valor_unitario}
                  onChange={(e) => setNewMaoDeObra({ ...newMaoDeObra, valor_unitario: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Criticidade</Label>
              <Select
                value={newMaoDeObra.prioridade}
                onValueChange={(value: 'verde' | 'amarelo' | 'vermelho') => setNewMaoDeObra({ ...newMaoDeObra, prioridade: value })}
              >
                <SelectTrigger className={cn(
                  "border-2",
                  newMaoDeObra.prioridade === 'vermelho' && "border-red-500",
                  newMaoDeObra.prioridade === 'amarelo' && "border-yellow-500",
                  newMaoDeObra.prioridade === 'verde' && "border-green-500"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vermelho">🔴 Imediato (Urgente)</SelectItem>
                  <SelectItem value="amarelo">🟡 Médio</SelectItem>
                  <SelectItem value="verde">🟢 Tranquilo (Precaução)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data de Retorno - obrigatória se prioridade for vermelho/amarelo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Retorno Estimada
                {newMaoDeObra.prioridade !== 'verde' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="date"
                value={newMaoDeObra.data_retorno_estimada}
                onChange={(e) => setNewMaoDeObra({ ...newMaoDeObra, data_retorno_estimada: e.target.value })}
                className={cn(
                  newMaoDeObra.prioridade !== 'verde' && !newMaoDeObra.data_retorno_estimada && "border-red-500/50"
                )}
              />
              <p className="text-xs text-muted-foreground">
                Data estimada para retorno do cliente (se não aprovar agora)
              </p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-lg">{formatCurrency(newMaoDeObra.quantidade * newMaoDeObra.valor_unitario)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMaoDeObraDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => addMaoDeObraMutation.mutate(newMaoDeObra)}
              disabled={!newMaoDeObra.descricao.trim() || addMaoDeObraMutation.isPending || (newMaoDeObra.prioridade !== 'verde' && !newMaoDeObra.data_retorno_estimada)}
            >
              {addMaoDeObraMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Adicionar Mão de Obra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Justificativa Dialog */}
      <Dialog open={showJustificativaDialog} onOpenChange={setShowJustificativaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Margem Abaixo do Mínimo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              A margem aplicada ({pendingItem?.margem.toFixed(1)}%) está abaixo do mínimo permitido ({MARGEM_MINIMA}%).
              Por favor, justifique a negociação para continuar.
            </p>
            <div className="space-y-2">
              <Label>Justificativa da Negociação *</Label>
              <Textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: Cliente fidelizado, pacote fechado, promoção especial..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowJustificativaDialog(false);
              setJustificativa("");
              setPendingItem(null);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (pendingItem && justificativa.trim()) {
                  addItemMutation.mutate({ ...pendingItem, justificativa });
                  setShowJustificativaDialog(false);
                }
              }}
              disabled={!justificativa.trim() || addItemMutation.isPending}
            >
              Confirmar
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
