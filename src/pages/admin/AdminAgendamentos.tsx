import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Search, Phone, Plus, FileText, CalendarClock, UserX, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type AppointmentStatus = Tables<"appointments">["status"];

interface AppointmentWithDetails {
  id: string;
  client: string;
  phone: string;
  vehicle: string;
  plate: string;
  vehicleId: string;
  services: string[];
  date: Date;
  time: string | null;
  isFullDay: boolean;
  status: AppointmentStatus;
  payInAdvance: boolean;
  finalPrice: number;
  userId: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  pendente: { label: "⏳ Pendente", color: "bg-amber-500/20 text-amber-500" },
  confirmado: { label: "✅ Confirmado", color: "bg-emerald-500/20 text-emerald-500" },
  concluido: { label: "🎉 Concluído", color: "bg-muted text-muted-foreground" },
  cancelado: { label: "❌ Cancelado", color: "bg-destructive/20 text-destructive" },
  diagnostico: { label: "🧠 Diagnóstico", color: "bg-purple-500/20 text-purple-600" },
  orcamento: { label: "📋 Orçamento", color: "bg-cyan-500/20 text-cyan-600" },
  aguardando_aprovacao: { label: "⏳ Aguardando Aprovação", color: "bg-yellow-500/20 text-yellow-600" },
  aguardando_pecas: { label: "😤 Aguardando Peças", color: "bg-orange-500/20 text-orange-600" },
  pronto_iniciar: { label: "🫵 Pronto para Iniciar", color: "bg-blue-500/20 text-blue-600" },
  em_execucao: { label: "🛠️ Em Execução", color: "bg-amber-500/20 text-amber-600" },
  em_teste: { label: "🧪 Em Teste", color: "bg-indigo-500/20 text-indigo-600" },
  pronto_retirada: { label: "💰 Pronto Retirada", color: "bg-emerald-500/20 text-emerald-600" },
};

// Fetch appointments with related data
async function fetchAppointments(): Promise<AppointmentWithDetails[]> {
  // Buscar appointments com vehicles e services
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      is_full_day,
      status,
      pay_in_advance,
      final_price,
      user_id,
      vehicle_id,
      vehicles (id, model, brand, plate),
      appointment_services (
        services (name)
      )
    `)
    .in("status", ["pendente", "confirmado"])
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  if (!appointments || appointments.length === 0) return [];

  // Buscar user_ids únicos para buscar profiles separadamente
  const userIds = [...new Set(appointments.map((apt: any) => apt.user_id).filter(Boolean))];
  
  // Buscar profiles por user_id
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, phone")
    .in("user_id", userIds);

  // Criar mapa de profiles
  const profilesMap = new Map(
    (profiles || []).map((p: any) => [p.user_id, p])
  );

  return appointments.map((apt: any) => {
    const profile = profilesMap.get(apt.user_id);
    return {
      id: apt.id,
      client: profile?.full_name || "Cliente",
      phone: profile?.phone || "",
      vehicle: apt.vehicles ? `${apt.vehicles.brand || ""} ${apt.vehicles.model}`.trim() : "Veículo",
      plate: apt.vehicles?.plate || "",
      vehicleId: apt.vehicle_id || "",
      services: apt.appointment_services?.map((as: any) => as.services?.name).filter(Boolean) || [],
      date: new Date(apt.appointment_date),
      time: apt.appointment_time,
      isFullDay: apt.is_full_day,
      status: apt.status,
      payInAdvance: apt.pay_in_advance,
      finalPrice: apt.final_price,
      userId: apt.user_id,
    };
  });
}

const AdminAgendamentos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: fetchAppointments,
  });

  // Mutation: Cancel and send to recovery
  const cancelMutation = useMutation({
    mutationFn: async (apt: AppointmentWithDetails) => {
      // 1. Update appointment status to cancelled
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "cancelado" })
        .eq("id", apt.id);

      if (updateError) throw updateError;

      // 2. Insert into recovery_leads
      const { error: insertError } = await supabase
        .from("recovery_leads")
        .insert({
          appointment_id: apt.id,
          user_id: apt.userId,
          client_name: apt.client,
          phone: apt.phone,
          vehicle_info: `${apt.vehicle} - ${apt.plate}`,
          original_service: apt.services.join(", "),
          original_date: format(apt.date, "yyyy-MM-dd"),
          recovery_status: "pending",
        });

      if (insertError) throw insertError;

      return apt;
    },
    onSuccess: (apt) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast.warning(`Lead enviado para recuperação: ${apt.client}`);
    },
    onError: (error) => {
      console.error("Error cancelling:", error);
      toast.error("Erro ao cancelar agendamento");
    },
  });

  // Mutation: Update status to diagnostico (opening OS)
  const openOSMutation = useMutation({
    mutationFn: async (apt: AppointmentWithDetails) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "diagnostico" })
        .eq("id", apt.id);

      if (error) throw error;
      return apt;
    },
    onSuccess: (apt) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      navigate("/admin/patio/" + apt.id);
      toast.success(`OS aberta para ${apt.client}`);
    },
    onError: (error) => {
      console.error("Error opening OS:", error);
      toast.error("Erro ao abrir OS");
    },
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.plate.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleOpenOS = (apt: AppointmentWithDetails) => {
    openOSMutation.mutate(apt);
  };

  const handleReagendar = (apt: AppointmentWithDetails) => {
    navigate("/reagendamento", {
      state: {
        appointmentId: apt.id,
        client: apt.client,
        vehicle: apt.vehicle,
        plate: apt.plate,
      },
    });
  };

  const handleCancelarERecuperar = (apt: AppointmentWithDetails) => {
    cancelMutation.mutate(apt);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-destructive">Erro ao carregar agendamentos</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, veículo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Button
            onClick={() => navigate("/admin/nova-os")}
            className="gradient-primary text-primary-foreground shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Appointments List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <Card key={apt.id} className="glass-card border-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Main Info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{apt.client}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {apt.phone || "Sem telefone"}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig[apt.status].color}`}
                          >
                            {statusConfig[apt.status].label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Veículo</p>
                            <p className="text-foreground font-medium">
                              {apt.vehicle} • {apt.plate}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Serviço</p>
                            <p className="text-foreground font-medium">
                              {apt.services.length > 0 ? apt.services.join(", ") : "Não especificado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Data/Hora</p>
                            <p className="text-foreground font-medium">
                              {format(apt.date, "dd/MM/yyyy", { locale: ptBR })}
                              {apt.isFullDay ? " (Dia inteiro)" : apt.time ? ` às ${apt.time}` : ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valor</p>
                            <p className="text-foreground font-medium">
                              {apt.finalPrice > 0
                                ? `R$ ${apt.finalPrice.toFixed(2)}`
                                : "Sob consulta"}
                              {apt.payInAdvance && (
                                <span className="text-xs text-emerald-500 ml-2">Pago</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions - 3 clear paths */}
                      <div className="flex lg:flex-col gap-2 p-4 bg-muted/30 lg:w-56">
                        {/* Abrir OS - Cliente chegou */}
                        <Button
                          size="sm"
                          className="flex-1 gradient-primary text-primary-foreground"
                          onClick={() => handleOpenOS(apt)}
                          disabled={openOSMutation.isPending}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Abrir OS
                        </Button>

                        {/* Reagendar */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReagendar(apt)}
                        >
                          <CalendarClock className="w-4 h-4 mr-2" />
                          Reagendar
                        </Button>

                        {/* Cancelar e Recuperar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelarERecuperar(apt)}
                          disabled={cancelMutation.isPending}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento pendente</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/nova-os")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Agendamento
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAgendamentos;