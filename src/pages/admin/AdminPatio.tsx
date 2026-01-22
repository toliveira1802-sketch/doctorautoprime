import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Package,
  FileText,
  MapPin,
  Loader2,
  Calendar,
  XCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrdemServico {
  id: string;
  numero_os: string;
  plate: string;
  vehicle: string;
  client_name: string;
  posicao_patio: string;
  prioridade: string;
  cor_card: string;
  tags: string[];
  elevador: string | null;
  box: string | null;
  mecanico_responsavel: string | null;
  tempo_estimado_horas: number | null;
  data_previsao_entrega: string | null;
  valor_aprovado: number;
  status: string;
  data_entrada: string;
}

interface Agendamento {
  id: string;
  plate: string;
  vehicle: string;
  client_name: string;
  status: string;
  scheduled_date: string;
}

interface PatioColumn {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
}

const columns: PatioColumn[] = [
  {
    id: "entrada",
    title: "Diagnóstico",
    icon: MapPin,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
  {
    id: "aguardando_orcamento",
    title: "Orçamento",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "aguardando_aprovacao",
    title: "Aguard. Aprovação",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "aguardando_pecas",
    title: "Aguard. Peças",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "em_execucao",
    title: "Em Execução",
    icon: Wrench,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "teste",
    title: "Teste",
    icon: AlertCircle,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "pronto",
    title: "Pronto",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    id: "entregue",
    title: "Entregue",
    icon: Car,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
];

const prioridadeColors = {
  baixa: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  media: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  alta: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  urgente: "bg-red-500/20 text-red-700 border-red-500/30",
};

export default function AdminPatio() {
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [showAgendadosModal, setShowAgendadosModal] = useState(false);
  const [showReagendadosModal, setShowReagendadosModal] = useState(false);
  const [showCanceladosModal, setShowCanceladosModal] = useState(false);

  const { data: ordensServico = [], isLoading, refetch } = useQuery({
    queryKey: ["patio-ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .not("status", "in", '("entregue","cancelado")')
        .order("data_entrada", { ascending: false });

      if (error) throw error;
      return data as OrdemServico[];
    },
    refetchInterval: 30000, // Atualiza a cada 30s
  });

  // Buscar agendamentos do dia
  const { data: agendamentos = [] } = useQuery({
    queryKey: ["agendamentos-hoje"],
    queryFn: async () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          status,
          scheduled_date,
          vehicle_id,
          vehicles (plate, model, brand),
          profiles (full_name)
        `)
        .gte("scheduled_date", hoje.toISOString())
        .lt("scheduled_date", amanha.toISOString())
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      return (data || []).map((apt: any) => ({
        id: apt.id,
        plate: apt.vehicles?.plate || "N/A",
        vehicle: `${apt.vehicles?.brand || ""} ${apt.vehicles?.model || ""}`.trim(),
        client_name: apt.profiles?.full_name || "Cliente",
        status: apt.status,
        scheduled_date: apt.scheduled_date,
      })) as Agendamento[];
    },
    refetchInterval: 30000,
  });

  const agendadosHoje = agendamentos.filter(a => a.status === "confirmado");
  const reagendadosHoje = agendamentos.filter(a => a.status === "reagendado");
  const canceladosHoje = agendamentos.filter(a => a.status === "cancelado");

  const getOSsByColumn = (columnId: string) => {
    // Juntar "pronto_iniciar" com "em_execucao"
    if (columnId === "em_execucao") {
      return ordensServico.filter((os) =>
        os.posicao_patio === "em_execucao" || os.posicao_patio === "pronto_iniciar"
      );
    }
    return ordensServico.filter((os) => os.posicao_patio === columnId);
  };

  const handleMoveOS = async (osId: string, newPosition: string) => {
    const { error } = await supabase
      .from("ordens_servico")
      .update({ posicao_patio: newPosition })
      .eq("id", osId);

    if (error) {
      toast.error("Erro ao mover veículo");
      return;
    }

    toast.success("Veículo movido com sucesso!");
    refetch();
  };

  const calcularTempoNoPatioHoras = (dataEntrada: string) => {
    const entrada = new Date(dataEntrada);
    const agora = new Date();
    const diffMs = agora.getTime() - entrada.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHoras;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Car className="w-8 h-8 text-primary" />
            Pátio - Controle de Veículos
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe em tempo real a posição de cada veículo
          </p>
        </div>
      </div>

      {/* Agendamentos do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="glass-card border-none cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setShowAgendadosModal(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{agendadosHoje.length}</p>
                <p className="text-sm text-muted-foreground">Agendamentos do Dia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card border-none cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setShowReagendadosModal(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">{reagendadosHoje.length}</p>
                <p className="text-sm text-muted-foreground">Reagendados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card border-none cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setShowCanceladosModal(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{canceladosHoje.length}</p>
                <p className="text-sm text-muted-foreground">Cancelados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gargalo - Etapa com mais veículos */}
        <Card className="glass-card border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                {(() => {
                  // Encontrar a etapa com mais veículos
                  let maxCount = 0;
                  let gargaloEtapa = null;

                  columns.forEach(column => {
                    const count = getOSsByColumn(column.id).length;
                    if (count > maxCount) {
                      maxCount = count;
                      gargaloEtapa = column;
                    }
                  });

                  return (
                    <>
                      <p className="text-3xl font-bold text-orange-600">{maxCount}</p>
                      <p className="text-sm text-muted-foreground">
                        Gargalo: {gargaloEtapa?.title || "N/A"}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modais de Agendamentos */}
      <Dialog open={showAgendadosModal} onOpenChange={setShowAgendadosModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Agendamentos do Dia ({agendadosHoje.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {agendadosHoje.map((agendamento) => (
                <Card key={agendamento.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold">{agendamento.plate}</p>
                      <p className="text-sm text-muted-foreground">{agendamento.vehicle}</p>
                      <p className="text-xs text-muted-foreground">{agendamento.client_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(agendamento.scheduled_date), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </Card>
              ))}
              {agendadosHoje.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum agendamento para hoje
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showReagendadosModal} onOpenChange={setShowReagendadosModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-yellow-600" />
              Reagendados ({reagendadosHoje.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {reagendadosHoje.map((agendamento) => (
                <Card key={agendamento.id} className="p-3 bg-yellow-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold">{agendamento.plate}</p>
                      <p className="text-sm text-muted-foreground">{agendamento.vehicle}</p>
                      <p className="text-xs text-muted-foreground">{agendamento.client_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(agendamento.scheduled_date), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </Card>
              ))}
              {reagendadosHoje.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum reagendamento
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showCanceladosModal} onOpenChange={setShowCanceladosModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Cancelados ({canceladosHoje.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {canceladosHoje.map((agendamento) => (
                <Card key={agendamento.id} className="p-3 bg-red-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold">{agendamento.plate}</p>
                      <p className="text-sm text-muted-foreground">{agendamento.vehicle}</p>
                      <p className="text-xs text-muted-foreground">{agendamento.client_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(agendamento.scheduled_date), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </Card>
              ))}
              {canceladosHoje.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum cancelamento
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Kanban Board - Layout 4x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const oss = getOSsByColumn(column.id);

          return (
            <Card key={column.id} className="glass-card border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${column.bgColor}`}>
                      <Icon className={`w-4 h-4 ${column.color}`} />
                    </div>
                    <span className="underline decoration-2 underline-offset-4">{column.title}</span>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {oss.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[500px] pr-4">
                  <div className="space-y-3">
                    {oss.map((os) => {
                      const tempoHoras = calcularTempoNoPatioHoras(os.data_entrada);

                      return (
                        <Card
                          key={os.id}
                          className="cursor-pointer hover:shadow-lg transition-all border-2"
                          style={{ borderColor: os.cor_card || "#3b82f6" }}
                          onClick={() => setSelectedOS(os)}
                        >
                          <CardContent className="p-3 space-y-2">
                            {/* Prioridade */}
                            <div className="flex items-center justify-between">
                              <Badge
                                className={
                                  prioridadeColors[os.prioridade as keyof typeof prioridadeColors] ||
                                  prioridadeColors.media
                                }
                              >
                                {os.prioridade}
                              </Badge>
                              <span className="text-xs font-mono text-muted-foreground">
                                {os.numero_os}
                              </span>
                            </div>

                            {/* Veículo */}
                            <div>
                              <p className="font-semibold text-sm">{os.vehicle}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {os.plate}
                              </p>
                            </div>

                            {/* Cliente */}
                            <p className="text-xs text-muted-foreground truncate">
                              {os.client_name}
                            </p>

                            {/* Localização */}
                            {(os.elevador || os.box) && (
                              <div className="flex gap-2 text-xs">
                                {os.elevador && (
                                  <Badge variant="outline" className="text-xs">
                                    🏗️ Elev. {os.elevador}
                                  </Badge>
                                )}
                                {os.box && (
                                  <Badge variant="outline" className="text-xs">
                                    📦 Box {os.box}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Mecânico */}
                            {os.mecanico_responsavel && (
                              <p className="text-xs text-muted-foreground">
                                👨‍🔧 {os.mecanico_responsavel}
                              </p>
                            )}

                            {/* Tempo no pátio */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{tempoHoras}h no pátio</span>
                            </div>

                            {/* Tags */}
                            {os.tags && os.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {os.tags.map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}

                    {oss.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Nenhum veículo
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
