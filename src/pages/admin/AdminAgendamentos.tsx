import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Search, Filter, Check, X, Clock, Phone, MessageSquare, Eye, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

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

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: typeof Clock }> = {
  pendente: { label: "⏳ Pendente", color: "bg-amber-500/20 text-amber-500", icon: Clock },
  confirmado: { label: "✅ Confirmado", color: "bg-emerald-500/20 text-emerald-500", icon: Check },
  concluido: { label: "🎉 Concluído", color: "bg-muted text-muted-foreground", icon: Check },
  cancelado: { label: "❌ Cancelado", color: "bg-destructive/20 text-destructive", icon: X },
  diagnostico: { label: "🧠 Diagnóstico", color: "bg-purple-500/20 text-purple-600", icon: Clock },
  aguardando_pecas: { label: "😤 Aguardando Peças", color: "bg-orange-500/20 text-orange-600", icon: Clock },
  pronto_iniciar: { label: "🫵 Pronto para Iniciar", color: "bg-blue-500/20 text-blue-600", icon: Clock },
  em_execucao: { label: "🛠️ Em Execução", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  pronto_retirada: { label: "💰 Pronto Retirada", color: "bg-emerald-500/20 text-emerald-600", icon: Clock },
};

const osStatuses: AppointmentStatus[] = [
  "diagnostico",
  "aguardando_pecas",
  "pronto_iniciar",
  "em_execucao",
  "pronto_retirada",
  "concluido",
];

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

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    toast.success(`Status alterado para ${statusConfig[newStatus].label}`);
  };

  const handleConfirm = (id: string) => {
    handleStatusChange(id, "confirmado");
  };

  const handleCancel = (id: string) => {
    handleStatusChange(id, "cancelado");
  };

  const handleComplete = (id: string) => {
    handleStatusChange(id, "concluido");
  };

  const handleViewOS = (id: string) => {
    navigate(`/admin/os/${id}`);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, veículo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pendente", "diagnostico", "em_execucao", "pronto_retirada", "concluido"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "text-xs",
                  statusFilter === status && "gradient-primary text-primary-foreground"
                )}
              >
                {status === "all" ? "Todos" : statusConfig[status as keyof typeof statusConfig]?.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => {
              const StatusIcon = statusConfig[apt.status].icon;
              
              return (
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
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                            statusConfig[apt.status].color
                          )}>
                            <StatusIcon className="w-3 h-3" />
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

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 p-4 bg-muted/30 lg:w-56">
                        {/* Status Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 justify-between"
                            >
                              <span className="truncate">{statusConfig[apt.status].label}</span>
                              <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Agendamento</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "pendente")}>
                              ⏳ Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "confirmado")}>
                              ✅ Confirmado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "cancelado")}>
                              ❌ Cancelado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status OS</DropdownMenuLabel>
                            {osStatuses.map((status) => (
                              <DropdownMenuItem 
                                key={status} 
                                onClick={() => handleStatusChange(apt.id, status)}
                              >
                                {statusConfig[status].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* View OS Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewOS(apt.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver OS
                        </Button>

                        {/* WhatsApp */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            window.open(`https://wa.me/55${apt.phone.replace(/\D/g, "")}`, "_blank");
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
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
