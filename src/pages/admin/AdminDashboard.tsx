import { useState, useEffect } from "react";
import { Calendar, Users, Wrench, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  appointmentsToday: number;
  newClientsMonth: number;
}

interface TodayAppointment {
  id: string;
  client: string;
  vehicle: string;
  service: string;
  time: string;
  status: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  confirmado: { label: "Confirmado", color: "bg-emerald-500/20 text-emerald-500" },
  em_execucao: { label: "Em execução", color: "bg-primary/20 text-primary" },
  pendente: { label: "Pendente", color: "bg-amber-500/20 text-amber-500" },
  diagnostico: { label: "Diagnóstico", color: "bg-purple-500/20 text-purple-500" },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ appointmentsToday: 0, newClientsMonth: 0 });
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

      // Fetch today's appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_time,
          status,
          vehicles (model, brand, plate),
          profiles!appointments_user_id_fkey (full_name),
          appointment_services (
            services (name)
          )
        `)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true });

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
      }

      const formattedAppointments: TodayAppointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        client: apt.profiles?.full_name || "Cliente",
        vehicle: apt.vehicles ? `${apt.vehicles.brand || ''} ${apt.vehicles.model}`.trim() : "Veículo",
        service: apt.appointment_services?.[0]?.services?.name || "Serviço",
        time: apt.appointment_time?.slice(0, 5) || "Dia todo",
        status: apt.status,
      }));

      setTodayAppointments(formattedAppointments);

      // Count today's appointments
      const appointmentsToday = appointmentsData?.length || 0;

      // Count new clients this month
      const { count: newClientsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth);

      setStats({
        appointmentsToday,
        newClientsMonth: newClientsCount || 0,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
        {/* Quick Actions */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-none">
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

          <Card className="glass-card border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.newClientsMonth}</p>
                  <p className="text-sm text-muted-foreground">Novos Clientes (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Agendamentos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
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
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusLabels[apt.status]?.color || "bg-muted text-muted-foreground"}`}>
                        {statusLabels[apt.status]?.label || apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
