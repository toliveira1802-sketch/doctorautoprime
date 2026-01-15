import { Calendar, Users, Wrench, Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "Agendamentos Hoje",
    value: "8",
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Novos Clientes (Mês)",
    value: "12",
    icon: Users,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

const recentAppointments = [
  { id: 1, client: "João Silva", vehicle: "VW Polo 2023", service: "Troca de Óleo", time: "09:00", status: "confirmado" },
  { id: 2, client: "Maria Santos", vehicle: "Fiat Argo 2022", service: "Revisão Completa", time: "10:00", status: "em_andamento" },
  { id: 3, client: "Pedro Lima", vehicle: "Hyundai HB20 2024", service: "Check-up", time: "11:00", status: "pendente" },
  { id: 4, client: "Ana Costa", vehicle: "Toyota Corolla 2023", service: "Alinhamento", time: "14:00", status: "pendente" },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  confirmado: { label: "Confirmado", color: "bg-emerald-500/20 text-emerald-500" },
  em_andamento: { label: "Em andamento", color: "bg-primary/20 text-primary" },
  pendente: { label: "Pendente", color: "bg-amber-500/20 text-amber-500" },
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="h-20 text-lg gap-3"
            onClick={() => navigate('/admin/agendamentos')}
          >
            <Calendar className="w-6 h-6" />
            Novo Agendamento
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Appointments */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Agendamentos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{apt.client}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {apt.vehicle} • {apt.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{apt.time}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusLabels[apt.status].color}`}>
                      {statusLabels[apt.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
