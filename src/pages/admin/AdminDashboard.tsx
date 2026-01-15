import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, FileText, Loader2, TrendingUp, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardStats {
  appointmentsToday: number;
  newClientsMonth: number;
  monthlyRevenue: number;
  valueTodayDelivery: number;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ 
    appointmentsToday: 0, 
    newClientsMonth: 0,
    monthlyRevenue: 0,
    valueTodayDelivery: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAppointments, setShowAppointments] = useState(false);
  const [showNewClients, setShowNewClients] = useState(false);
  const [showReadyToDeliver, setShowReadyToDeliver] = useState(false);
  
  // Data for modals
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [newClients, setNewClients] = useState<NewClient[]>([]);
  const [readyToDeliver, setReadyToDeliver] = useState<ReadyToDeliver[]>([]);
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
      ]);

      const monthlyRevenue = monthlyRevenueResult.data?.reduce((sum, r) => sum + Number(r.valor || 0), 0) || 0;
      const valueTodayDelivery = todayDeliveryResult.data?.reduce((sum, r) => sum + Number(r.valor_final || 0), 0) || 0;

      setStats({
        appointmentsToday: appointmentsTodayResult.count || 0,
        newClientsMonth: newClientsResult.count || 0,
        monthlyRevenue,
        valueTodayDelivery,
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
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Botões principais */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="h-20 text-lg gap-3"
            onClick={() => navigate('/admin/agendamentos')}
          >
            <Calendar className="w-6 h-6" />
            Ver Agendamentos
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            className="h-20 text-lg gap-3"
            onClick={() => navigate('/admin/nova-os')}
          >
            <FileText className="w-6 h-6" />
            Nova OS
          </Button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-2 gap-4">
          {/* Agendamentos Hoje */}
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

          {/* Novos Clientes */}
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

          {/* Faturado Mês */}
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

          {/* Valor para Sair Hoje */}
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
        </div>
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
    </AdminLayout>
  );
};

export default AdminDashboard;
