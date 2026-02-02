import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, FileText, Loader2, TrendingUp, RotateCcw, XCircle, Syringe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import corinthiansLogo from "@/assets/corinthians-logo.png";

interface DashboardStats {
  appointmentsToday: number;
  newClientsMonth: number;
  monthlyRevenue: number;
  valueTodayDelivery: number;
  returnsMonth: number;
  cancelledMonth: number;
}

interface TodayAppointment {
  id: string;
  time: string;
  client_name: string;
  vehicle: string;
  status: string;
}

interface NewClient {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
}

interface ReadyToDeliver {
  id: string;
  numero_os: string;
  vehicle: string;
  client_name: string;
  valor_final: number;
}

interface ReturnVehicle {
  id: string;
  plate: string;
  vehicle: string;
  client_name: string;
  data_entrega: string;
}

interface CancelledAppointment {
  id: string;
  client_name: string;
  phone: string;
  vehicle: string;
  cancelled_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    newClientsMonth: 0,
    monthlyRevenue: 0,
    valueTodayDelivery: 0,
    returnsMonth: 0,
    cancelledMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAppointments, setShowAppointments] = useState(false);
  const [showNewClients, setShowNewClients] = useState(false);
  const [showReadyToDeliver, setShowReadyToDeliver] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  // Data for modals
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [newClients, setNewClients] = useState<NewClient[]>([]);
  const [readyToDeliver, setReadyToDeliver] = useState<ReadyToDeliver[]>([]);
  const [returnVehicles, setReturnVehicles] = useState<ReturnVehicle[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<CancelledAppointment[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

      const [
        appointmentsTodayResult,
        newClientsResult,
        monthlyRevenueResult,
        todayDeliveryResult,
        returnsResult,
        cancelledResult,
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("appointment_date", today),

        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthStart),

        supabase
          .from("faturamento")
          .select("valor")
          .gte("data_entrega", monthStart)
          .lte("data_entrega", monthEnd),

        supabase
          .from("ordens_servico")
          .select("valor_final")
          .eq("status", "pronto_retirada"),

        // Retornos do mês (veículos que já vieram antes)
        supabase
          .from("ordens_servico")
          .select("plate", { count: "exact", head: true })
          .gte("data_entrada", monthStart)
          .lte("data_entrada", monthEnd),

        // Agendamentos cancelados do mês
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("status", "cancelado")
          .gte("appointment_date", monthStart)
          .lte("appointment_date", monthEnd),
      ]);

      const monthlyRevenue = monthlyRevenueResult.data?.reduce((sum, r) => sum + Number(r.valor || 0), 0) || 0;
      const valueTodayDelivery = todayDeliveryResult.data?.reduce((sum, r) => sum + Number(r.valor_final || 0), 0) || 0;

      setStats({
        appointmentsToday: appointmentsTodayResult.count || 0,
        newClientsMonth: newClientsResult.count || 0,
        monthlyRevenue,
        valueTodayDelivery,
        returnsMonth: returnsResult.count || 0,
        cancelledMonth: cancelledResult.count || 0,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    setModalLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_time,
          status,
          vehicles (model, brand, plate),
          profiles!appointments_user_id_fkey (full_name)
        `)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true });

      setTodayAppointments((data || []).map((apt: any) => ({
        id: apt.id,
        time: apt.appointment_time?.slice(0, 5) || "Dia todo",
        client_name: apt.profiles?.full_name || "Cliente",
        vehicle: apt.vehicles ? `${apt.vehicles.brand || ''} ${apt.vehicles.model} - ${apt.vehicles.plate}`.trim() : "Veículo",
        status: apt.status,
      })));
    } catch (error) {
      console.error("Error fetching today appointments:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchNewClients = async () => {
    setModalLoading(true);
    try {
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .gte("created_at", monthStart)
        .order("created_at", { ascending: false });

      setNewClients((data || []).map((client: any) => ({
        id: client.id,
        full_name: client.full_name || "Sem nome",
        phone: client.phone || "-",
        created_at: format(new Date(client.created_at), "dd/MM/yyyy"),
      })));
    } catch (error) {
      console.error("Error fetching new clients:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchReadyToDeliver = async () => {
    setModalLoading(true);
    try {
      const { data } = await supabase
        .from("ordens_servico")
        .select("id, numero_os, vehicle, client_name, valor_final")
        .eq("status", "pronto_retirada")
        .order("updated_at", { ascending: false });

      setReadyToDeliver((data || []).map((os: any) => ({
        id: os.id,
        numero_os: os.numero_os,
        vehicle: os.vehicle,
        client_name: os.client_name || "Cliente",
        valor_final: Number(os.valor_final || 0),
      })));
    } catch (error) {
      console.error("Error fetching ready to deliver:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchReturnVehicles = async () => {
    setModalLoading(true);
    try {
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

      const { data } = await supabase
        .from("ordens_servico")
        .select("id, plate, vehicle, client_name, data_entrada")
        .gte("data_entrada", monthStart)
        .lte("data_entrada", monthEnd)
        .order("data_entrada", { ascending: false });

      setReturnVehicles((data || []).map((os: any) => ({
        id: os.id,
        plate: os.plate,
        vehicle: os.vehicle,
        client_name: os.client_name || "Cliente",
        data_entrega: os.data_entrada ? format(new Date(os.data_entrada), "dd/MM/yyyy") : "-",
      })));
    } catch (error) {
      console.error("Error fetching return vehicles:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchCancelledAppointments = async () => {
    setModalLoading(true);
    try {
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

      const { data } = await supabase
        .from("appointments")
        .select(`
          id,
          updated_at,
          vehicles (model, brand, plate),
          profiles!appointments_user_id_fkey (full_name, phone)
        `)
        .eq("status", "cancelado")
        .gte("appointment_date", monthStart)
        .lte("appointment_date", monthEnd)
        .order("updated_at", { ascending: false });

      setCancelledAppointments((data || []).map((apt: any) => ({
        id: apt.id,
        client_name: apt.profiles?.full_name || "Cliente",
        phone: apt.profiles?.phone || "-",
        vehicle: apt.vehicles ? `${apt.vehicles.brand || ''} ${apt.vehicles.model} - ${apt.vehicles.plate}`.trim() : "Veículo",
        cancelled_at: apt.updated_at ? format(new Date(apt.updated_at), "dd/MM/yyyy") : "-",
      })));
    } catch (error) {
      console.error("Error fetching cancelled appointments:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAppointmentsClick = () => {
    fetchTodayAppointments();
    setShowAppointments(true);
  };

  const handleNewClientsClick = () => {
    fetchNewClients();
    setShowNewClients(true);
  };

  const handleReadyToDeliverClick = () => {
    fetchReadyToDeliver();
    setShowReadyToDeliver(true);
  };

  const handleReturnsClick = () => {
    fetchReturnVehicles();
    setShowReturns(true);
  };

  const handleCancelledClick = () => {
    fetchCancelledAppointments();
    setShowCancelled(true);
  };

  const statusLabels: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    em_execucao: "Em Execução",
    diagnostico: "Diagnóstico",
    orcamento: "Orçamento",
    aguardando_aprovacao: "Aguardando",
    pronto_retirada: "Pronto",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Botão único de Pendências */}
        <div className="grid grid-cols-1 gap-4">
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate('/admin/ordens-servico')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">📋</span>
                <span className="text-xl font-semibold text-foreground">Pendências do dia</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Navegação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Operacional */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-blue-500/10 to-blue-600/5"
            onClick={() => navigate('/admin/operacional')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="text-3xl">⚙️</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Operacional</span>
                <span className="text-xs text-muted-foreground">OSs, Pátio, Agendamentos</span>
              </div>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-green-500/10 to-green-600/5"
            onClick={() => navigate('/admin/financeiro')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Financeiro</span>
                <span className="text-xs text-muted-foreground">Faturamento, Despesas</span>
              </div>
            </CardContent>
          </Card>

          {/* Produtividade */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-purple-500/10 to-purple-600/5"
            onClick={() => navigate('/admin/produtividade')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Produtividade</span>
                <span className="text-xs text-muted-foreground">Métricas, Performance</span>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-orange-500/10 to-orange-600/5"
            onClick={() => navigate('/admin/agenda-mecanicos')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <span className="text-3xl">📅</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Agenda</span>
                <span className="text-xs text-muted-foreground">Mecânicos, Feedback</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-2 gap-4">
          {/* Esquerda: Faturado Mês */}
          <Card className="glass-card border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {stats.monthlyRevenue.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">Faturado (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direita: Agendamentos Hoje */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={handleAppointmentsClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.appointmentsToday}</p>
                  <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Esquerda: Novos Clientes */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={handleNewClientsClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.newClientsMonth}</p>
                  <p className="text-sm text-muted-foreground">Novos Clientes (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direita: Retorno do Mês */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={handleReturnsClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.returnsMonth}</p>
                  <p className="text-sm text-muted-foreground">Retorno do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Esquerda: Valor para Sair */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={handleReadyToDeliverClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {stats.valueTodayDelivery.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor p/ Sair Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direita: Agendamentos Cancelados */}
          <Card
            className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={handleCancelledClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.cancelledMonth}</p>
                  <p className="text-sm text-muted-foreground">Cancelados (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Modal Agendamentos Hoje */}
      <Dialog open={showAppointments} onOpenChange={setShowAppointments}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Agendamentos de Hoje
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {modalLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{apt.client_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{apt.time}</p>
                        <p className="text-xs text-muted-foreground">{statusLabels[apt.status] || apt.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum agendamento para hoje</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Novos Clientes */}
      <Dialog open={showNewClients} onOpenChange={setShowNewClients}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              Novos Clientes do Mês
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {modalLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : newClients.length > 0 ? (
              <div className="space-y-3">
                {newClients.map((client) => (
                  <div key={client.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{client.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum cliente novo este mês</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Valor para Sair */}
      <Dialog open={showReadyToDeliver} onOpenChange={setShowReadyToDeliver}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Prontos para Retirada
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {modalLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : readyToDeliver.length > 0 ? (
              <div className="space-y-3">
                {readyToDeliver.map((os) => (
                  <div key={os.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{os.client_name}</p>
                        <p className="text-sm text-muted-foreground">{os.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{os.numero_os}</p>
                      </div>
                      <p className="font-bold text-emerald-500">
                        R$ {os.valor_final.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum veículo pronto para retirada</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Retorno do Mês */}
      <Dialog open={showReturns} onOpenChange={setShowReturns}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-500" />
              Retornos do Mês
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {modalLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : returnVehicles.length > 0 ? (
              <div className="space-y-3">
                {returnVehicles.map((rv) => (
                  <div key={rv.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-primary">{rv.plate}</p>
                        <p className="text-sm text-muted-foreground">{rv.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{rv.client_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{rv.data_entrega}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum retorno este mês</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Agendamentos Cancelados */}
      <Dialog open={showCancelled} onOpenChange={setShowCancelled}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Agendamentos Cancelados
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {modalLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : cancelledAppointments.length > 0 ? (
              <div className="space-y-3">
                {cancelledAppointments.map((ca) => (
                  <div key={ca.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{ca.client_name}</p>
                        <p className="text-sm text-muted-foreground">{ca.phone}</p>
                        <p className="text-xs text-muted-foreground">{ca.vehicle}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{ca.cancelled_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum cancelamento este mês</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
