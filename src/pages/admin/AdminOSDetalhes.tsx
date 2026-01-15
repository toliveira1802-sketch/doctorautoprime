import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, Plus, Trash2, Phone, Car, User, 
  Calendar, DollarSign, FileText, Wrench, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, Edit2
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  orcamento: { label: "Orçamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: FileText },
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<Partial<OrdemServico>>({});
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    descricao: "",
    tipo: "servico",
    quantidade: 1,
    valor_unitario: 0,
  });

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

            {/* Diagnosis */}
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

            {/* Items / Budget */}
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
                  <div className="space-y-3">
                    {itens.map((item) => {
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
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.tipo === "servico" ? "Serviço" : "Peça"}
                              </Badge>
                              <span className="font-medium">{item.descricao}</span>
                            </div>
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

                    {/* Totals */}
                    <div className="border-t border-border pt-4 mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Orçado:</span>
                        <span className="font-medium">{formatCurrency(totalOrcado)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Total Aprovado:</span>
                        <span className="font-medium text-green-600">{formatCurrency(totalAprovado)}</span>
                      </div>
                      {totalRecusado > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Total Recusado:</span>
                          <span className="font-medium text-red-600">{formatCurrency(totalRecusado)}</span>
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
                    <SelectItem value="orcamento">Orçamento</SelectItem>
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

            {/* Values Summary */}
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
    </AdminLayout>
  );
}
