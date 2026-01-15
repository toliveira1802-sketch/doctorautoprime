import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, FileText, Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface DashboardStats {
  appointmentsToday: number;
  newClientsMonth: number;
  monthlyRevenue: number;
  valueTodayDelivery: number;
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
        // Agendamentos de hoje
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("appointment_date", today),
        
        // Novos clientes do mês
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthStart),
        
        // Faturamento do mês
        supabase
          .from("faturamento")
          .select("valor")
          .gte("data_entrega", monthStart)
          .lte("data_entrega", monthEnd),
        
        // Valor para sair hoje (OS com status pronto_retirada)
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

          {/* Novos Clientes */}
          <Card className="glass-card border-none">
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
          <Card className="glass-card border-none">
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
    </AdminLayout>
  );
};

export default AdminDashboard;
