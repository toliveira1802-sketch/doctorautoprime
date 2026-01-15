import { useEffect, useState } from "react";
import { 
  Car, Calendar, Users, DollarSign, TrendingUp, Clock, 
  CheckCircle, AlertCircle, Wrench, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  vehiclesInPatio: number;
  todayAppointments: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  pendingApprovals: number;
  completedToday: number;
  activeClients: number;
  avgServiceTime: number;
}

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    vehiclesInPatio: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    monthlyRevenueChange: 0,
    pendingApprovals: 0,
    completedToday: 0,
    activeClients: 0,
    avgServiceTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
      const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
      const lastMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");

      // Fetch all stats in parallel
      const [
        vehiclesInPatioResult,
        todayAppointmentsResult,
        pendingApprovalsResult,
        completedTodayResult,
        monthlyRevenueResult,
        lastMonthRevenueResult,
        activeClientsResult,
      ] = await Promise.all([
        // Vehicles in patio (not completed or cancelled)
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .in("status", ["diagnostico", "orcamento", "aguardando_aprovacao", "aguardando_pecas", "pronto_iniciar", "em_execucao", "em_teste", "pronto_retirada"]),
        
        // Today's appointments
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("appointment_date", today),
        
        // Pending approvals
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("status", "aguardando_aprovacao"),
        
        // Completed today
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("status", "concluido")
          .eq("appointment_date", today),
        
        // Monthly revenue
        supabase
          .from("faturamento")
          .select("valor")
          .gte("data_entrega", monthStart)
          .lte("data_entrega", monthEnd),
        
        // Last month revenue for comparison
        supabase
          .from("faturamento")
          .select("valor")
          .gte("data_entrega", lastMonthStart)
          .lte("data_entrega", lastMonthEnd),
        
        // Active clients (with appointments this month)
        supabase
          .from("appointments")
          .select("user_id", { count: "exact", head: true })
          .gte("appointment_date", monthStart)
          .lte("appointment_date", monthEnd),
      ]);

      const monthlyRevenue = monthlyRevenueResult.data?.reduce((sum, r) => sum + Number(r.valor), 0) || 0;
      const lastMonthRevenue = lastMonthRevenueResult.data?.reduce((sum, r) => sum + Number(r.valor), 0) || 0;
      const revenueChange = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      setStats({
        vehiclesInPatio: vehiclesInPatioResult.count || 0,
        todayAppointments: todayAppointmentsResult.count || 0,
        monthlyRevenue,
        monthlyRevenueChange: revenueChange,
        pendingApprovals: pendingApprovalsResult.count || 0,
        completedToday: completedTodayResult.count || 0,
        activeClients: activeClientsResult.count || 0,
        avgServiceTime: 0, // Would need more complex calculation
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Veículos no Pátio",
      value: stats.vehiclesInPatio,
      icon: Car,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Agendamentos Hoje",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Faturamento do Mês",
      value: `R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      change: stats.monthlyRevenueChange,
    },
    {
      title: "Aguardando Aprovação",
      value: stats.pendingApprovals,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Concluídos Hoje",
      value: stats.completedToday,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Clientes Ativos",
      value: stats.activeClients,
      icon: Users,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da operação - {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? "..." : stat.value}
                    </p>
                    {stat.change !== undefined && !loading && (
                      <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {stat.change >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>{Math.abs(stat.change).toFixed(1)}% vs mês anterior</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a 
                href="/admin/nova-os" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-center">Nova OS</span>
              </a>
              <a 
                href="/admin/patio" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Car className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-center">Ver Pátio</span>
              </a>
              <a 
                href="/admin/agendamentos" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm text-center">Agendamentos</span>
              </a>
              <a 
                href="/admin/financeiro" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm text-center">Financeiro</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardOverview;
