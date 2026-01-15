import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Search, Clock, Phone, Plus, FileText, CalendarClock, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";

type AppointmentStatus = 
  | "pendente" 
  | "confirmado" 
  | "concluido" 
  | "cancelado"
  | "diagnostico"
  | "aguardando_pecas"
  | "pronto_iniciar"
  | "em_execucao"
  | "pronto_retirada";

interface Appointment {
  id: string;
  client: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  date: Date;
  time: string | null;
  isFullDay: boolean;
  status: AppointmentStatus;
  payInAdvance: boolean;
  finalPrice: number;
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    client: "João Silva",
    phone: "(11) 99999-1234",
    vehicle: "VW Polo",
    plate: "ABC-1234",
    service: "Troca de Óleo",
    date: new Date(2026, 0, 15),
    time: "09:00",
    isFullDay: false,
    status: "diagnostico",
    payInAdvance: true,
    finalPrice: 189.90,
  },
  {
    id: "2",
    client: "Maria Santos",
    phone: "(11) 98888-5678",
    vehicle: "Fiat Argo",
    plate: "XYZ-5678",
    service: "Revisão Completa",
    date: new Date(2026, 0, 15),
    time: "10:00",
    isFullDay: false,
    status: "em_execucao",
    payInAdvance: false,
    finalPrice: 450.00,
  },
  {
    id: "3",
    client: "Pedro Lima",
    phone: "(11) 97777-9012",
    vehicle: "Hyundai HB20",
    plate: "DEF-9012",
    service: "Diagnóstico Completo",
    date: new Date(2026, 0, 16),
    time: null,
    isFullDay: true,
    status: "pendente",
    payInAdvance: false,
    finalPrice: 0,
  },
];

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  pendente: { label: "⏳ Pendente", color: "bg-amber-500/20 text-amber-500" },
  confirmado: { label: "✅ Confirmado", color: "bg-emerald-500/20 text-emerald-500" },
  concluido: { label: "🎉 Concluído", color: "bg-muted text-muted-foreground" },
  cancelado: { label: "❌ Cancelado", color: "bg-destructive/20 text-destructive" },
  diagnostico: { label: "🧠 Diagnóstico", color: "bg-purple-500/20 text-purple-600" },
  aguardando_pecas: { label: "😤 Aguardando Peças", color: "bg-orange-500/20 text-orange-600" },
  pronto_iniciar: { label: "🫵 Pronto para Iniciar", color: "bg-blue-500/20 text-blue-600" },
  em_execucao: { label: "🛠️ Em Execução", color: "bg-amber-500/20 text-amber-600" },
  pronto_retirada: { label: "💰 Pronto Retirada", color: "bg-emerald-500/20 text-emerald-600" },
};

const AdminAgendamentos = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenOS = (apt: Appointment) => {
    // Navigate to nova-os with pre-filled data
    navigate("/admin/nova-os", { 
      state: { 
        fromAppointment: apt.id,
        client: apt.client,
        phone: apt.phone,
        vehicle: apt.vehicle,
        plate: apt.plate,
        service: apt.service
      } 
    });
    toast.success("Abrindo OS para " + apt.client);
  };

  const handleReagendar = (apt: Appointment) => {
    // TODO: Open reschedule modal or navigate
    toast.info("Reagendamento para " + apt.client);
  };

  const handleCancelarERecuperar = (apt: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, status: "cancelado" as AppointmentStatus } : a))
    );
    // TODO: Send to recovery base
    toast.warning("Lead enviado para recuperação: " + apt.client);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header & Filters */}
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

        {/* Appointments List */}
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
                            {apt.phone}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig[apt.status].color}`}>
                          {statusConfig[apt.status].label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Veículo</p>
                          <p className="text-foreground font-medium">{apt.vehicle} • {apt.plate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Serviço</p>
                          <p className="text-foreground font-medium">{apt.service}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data/Hora</p>
                          <p className="text-foreground font-medium">
                            {format(apt.date, "dd/MM/yyyy", { locale: ptBR })}
                            {apt.isFullDay ? " (Dia inteiro)" : ` às ${apt.time}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor</p>
                          <p className="text-foreground font-medium">
                            {apt.finalPrice > 0 ? `R$ ${apt.finalPrice.toFixed(2)}` : "Sob consulta"}
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
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAgendamentos;
