import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, Filter, Eye, FileText, AlertTriangle, 
  CheckCircle, XCircle, Clock, Wrench, Loader2, Phone,
  ChevronDown, ChevronRight, DollarSign, Calendar
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type OSStatus = "orcamento" | "aprovado" | "parcial" | "recusado" | "em_execucao" | "concluido" | "entregue";

interface OrdemServicoItem {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number | null;
  valor_unitario: number | null;
  valor_total: number | null;
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
  created_at: string;
  itens?: OrdemServicoItem[];
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

export default function AdminOrdensServico() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch all OS with items
  const { data: ordensServico = [], isLoading } = useQuery({
    queryKey: ["ordens-servico"],
    queryFn: async () => {
      const { data: ordens, error: ordensError } = await supabase
        .from("ordens_servico")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordensError) throw ordensError;

      // Fetch items for all OS
      const { data: itens, error: itensError } = await supabase
        .from("ordens_servico_itens")
        .select("*");

      if (itensError) throw itensError;

      // Map items to their respective OS
      const ordensWithItens = (ordens || []).map(os => ({
        ...os,
        itens: (itens || []).filter(item => item.ordem_servico_id === os.id),
      }));

      return ordensWithItens as OrdemServico[];
    },
  });

  // Filter OS based on search and status
  const filteredOS = ordensServico.filter(os => {
    const matchesSearch = 
      os.numero_os.toLowerCase().includes(searchQuery.toLowerCase()) ||
      os.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      os.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (os.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === "all" || os.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: ordensServico.length,
    finalizadas: ordensServico.filter(os => os.status === "concluido" || os.status === "entregue").length,
    orcamento: ordensServico.filter(os => os.status === "orcamento").length,
    aprovado: ordensServico.filter(os => os.status === "aprovado" || os.status === "parcial").length,
    recusado: ordensServico.filter(os => os.status === "recusado").length,
    valorTotal: ordensServico
      .filter(os => os.status === "concluido" || os.status === "entregue")
      .reduce((acc, os) => acc + (os.valor_final || 0), 0),
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

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

  const formatShortDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yy", { locale: ptBR });
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground text-sm">Gerencie todas as OS da oficina</p>
          </div>
          <Button onClick={() => navigate("/admin/nova-os")} className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova OS
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600">Orçamento</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.orcamento}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Aprovadas</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.aprovado}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Recusadas</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.recusado}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">Faturado</span>
              </div>
              <p className="text-lg font-bold mt-1 text-emerald-600">{formatCurrency(stats.valorTotal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
            <TabsTrigger value="todas">Todas as OS</TabsTrigger>
            <TabsTrigger value="finalizadas" className="relative">
              Finalizadas
              {stats.finalizadas > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-emerald-500/20 text-emerald-600">
                  {stats.finalizadas}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4 mt-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, placa, veículo ou cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="orcamento">Orçamento</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredOS.length === 0 ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma OS encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando uma nova ordem de serviço"}
                  </p>
                  <Button onClick={() => navigate("/admin/nova-os")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova OS
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente / Veículo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Entrada</TableHead>
                      <TableHead className="hidden lg:table-cell">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOS.map((os) => {
                      const status = statusConfig[os.status] || statusConfig.orcamento;
                      const StatusIcon = status.icon;
                      const isExpanded = expandedRows.has(os.id);
                      const hasItems = os.itens && os.itens.length > 0;
                      const rejectedCount = os.itens?.filter(i => i.status === "recusado").length || 0;

                      return (
                        <>
                          <TableRow 
                            key={os.id} 
                            className="hover:bg-muted/30 cursor-pointer"
                            onClick={() => hasItems && toggleRow(os.id)}
                          >
                            <TableCell className="w-10">
                              {hasItems && (
                                <button className="p-1 hover:bg-muted rounded">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </button>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-mono font-medium text-foreground">
                                {os.numero_os}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{os.client_name || "Cliente não informado"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {os.plate} - {os.vehicle}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("gap-1", status.color)}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                              {rejectedCount > 0 && (
                                <Badge variant="outline" className="ml-1 bg-orange-500/10 text-orange-600 border-orange-500/20">
                                  {rejectedCount} itens recusados
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {formatShortDate(os.data_entrada)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-right">
                                {os.status === "concluido" || os.status === "entregue" ? (
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(os.valor_final)}
                                  </span>
                                ) : os.valor_aprovado && os.valor_aprovado > 0 ? (
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(os.valor_aprovado)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {formatCurrency(os.valor_orcado)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOS(os);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && hasItems && (
                            <TableRow className="bg-muted/20">
                              <TableCell colSpan={7} className="p-0">
                                <div className="p-4 space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground mb-3">
                                    Itens do Orçamento ({os.itens?.length})
                                  </p>
                                  <div className="space-y-2">
                                    {os.itens?.map((item) => {
                                      const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;
                                      return (
                                        <div
                                          key={item.id}
                                          className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border",
                                            item.status === "recusado" && "bg-red-500/5 border-red-500/20"
                                          )}
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs">
                                                {item.tipo === "servico" ? "Serviço" : "Peça"}
                                              </Badge>
                                              <span className="font-medium text-foreground">
                                                {item.descricao}
                                              </span>
                                            </div>
                                            {item.motivo_recusa && (
                                              <p className="text-sm text-red-600 mt-1">
                                                Motivo: {item.motivo_recusa}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground">
                                              {item.quantidade}x {formatCurrency(item.valor_unitario)}
                                            </span>
                                            <span className="font-medium">
                                              {formatCurrency(item.valor_total)}
                                            </span>
                                            <Badge variant="outline" className={itemStatus.color}>
                                              {itemStatus.label}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="finalizadas" className="space-y-4 mt-4">
            {ordensServico.filter(os => os.status === "concluido" || os.status === "entregue").length === 0 ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma OS finalizada</h3>
                  <p className="text-muted-foreground">As ordens concluídas aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ordensServico
                  .filter(os => os.status === "concluido" || os.status === "entregue")
                  .map((os) => (
                    <Card key={os.id} className="bg-emerald-500/5 border-emerald-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-lg">{os.numero_os}</span>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {os.status === "entregue" ? "Entregue" : "Concluído"}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{os.client_name}</p>
                              <p className="text-sm text-muted-foreground">{os.plate} - {os.vehicle}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Entrada: {formatShortDate(os.data_entrada)}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">
                                  Final: {formatCurrency(os.valor_final)}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/ordens-servico/${os.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver OS
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* OS Details Dialog */}
      <Dialog open={!!selectedOS} onOpenChange={() => setSelectedOS(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="font-mono">{selectedOS?.numero_os}</span>
              {selectedOS && (
                <Badge 
                  variant="outline" 
                  className={statusConfig[selectedOS.status]?.color}
                >
                  {statusConfig[selectedOS.status]?.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOS && (
            <div className="space-y-6">
              {/* Client & Vehicle Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOS.client_name || "-"}</p>
                  {selectedOS.client_phone && (
                    <a 
                      href={`tel:${selectedOS.client_phone}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedOS.client_phone}
                    </a>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Veículo</p>
                  <p className="font-medium">{selectedOS.vehicle}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedOS.plate}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Entrada</p>
                  <p className="text-sm font-medium">{formatDate(selectedOS.data_entrada)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orçamento</p>
                  <p className="text-sm font-medium">{formatDate(selectedOS.data_orcamento)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aprovação</p>
                  <p className="text-sm font-medium">{formatDate(selectedOS.data_aprovacao)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrega</p>
                  <p className="text-sm font-medium">{formatDate(selectedOS.data_entrega)}</p>
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-blue-600 mb-1">Orçado</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(selectedOS.valor_orcado)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-green-600 mb-1">Aprovado</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedOS.valor_aprovado)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-500/10 border-emerald-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-emerald-600 mb-1">Final</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(selectedOS.valor_final)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Problem Description */}
              {selectedOS.descricao_problema && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Descrição do Problema</p>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{selectedOS.descricao_problema}</p>
                </div>
              )}

              {/* Diagnosis */}
              {selectedOS.diagnostico && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{selectedOS.diagnostico}</p>
                </div>
              )}

              {/* Refusal Reason */}
              {selectedOS.motivo_recusa && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Motivo da Recusa</p>
                  <p className="text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-foreground">
                    {selectedOS.motivo_recusa}
                  </p>
                </div>
              )}

              {/* Items */}
              {selectedOS.itens && selectedOS.itens.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Itens do Orçamento ({selectedOS.itens.length})
                  </p>
                  <div className="space-y-2">
                    {selectedOS.itens.map((item) => {
                      const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            item.status === "recusado" && "bg-red-500/5 border-red-500/20",
                            item.status === "aprovado" && "bg-green-500/5 border-green-500/20"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.tipo === "servico" ? "Serviço" : "Peça"}
                              </Badge>
                              <span className="font-medium">{item.descricao}</span>
                            </div>
                            {item.motivo_recusa && (
                              <p className="text-sm text-red-600 mt-1">
                                Motivo: {item.motivo_recusa}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {item.quantidade}x {formatCurrency(item.valor_unitario)}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.valor_total)}
                            </span>
                            <Badge variant="outline" className={itemStatus.color}>
                              {itemStatus.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Observations */}
              {selectedOS.observacoes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Observações</p>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{selectedOS.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
