import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Bell, 
  AlertTriangle, 
  Droplets, 
  Snowflake, 
  MessageSquare, 
  Calendar, 
  Phone,
  X,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Icon mapping for alert types
const alertIcons: Record<string, React.ElementType> = {
  pending_items: AlertTriangle,
  oil_change: Droplets,
  seasonal: Snowflake,
  custom: MessageSquare,
};

const alertColors: Record<string, string> = {
  pending_items: "text-amber-500 bg-amber-500/20",
  oil_change: "text-blue-500 bg-blue-500/20",
  seasonal: "text-cyan-500 bg-cyan-500/20",
  custom: "text-purple-500 bg-purple-500/20",
};

const statusBadges: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Pendente", color: "bg-amber-500/20 text-amber-500" },
  sent: { label: "Enviado", color: "bg-blue-500/20 text-blue-500" },
  read: { label: "Lido", color: "bg-muted text-muted-foreground" },
  dismissed: { label: "Dispensado", color: "bg-muted text-muted-foreground" },
  completed: { label: "Concluído", color: "bg-emerald-500/20 text-emerald-500" },
};

const Avisos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch user alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["user-alerts", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .eq("target_type", "client")
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Mutation to record alert click
  const recordClick = useMutation({
    mutationFn: async ({ alertId, action }: { alertId: string; action: string }) => {
      if (!userId) return;

      // Record the click
      const { error: clickError } = await supabase
        .from("alert_clicks")
        .insert({
          alert_id: alertId,
          user_id: userId,
          action,
        });

      if (clickError) throw clickError;

      // Update alert status if needed
      if (action === "click" || action === "schedule") {
        const { error: updateError } = await supabase
          .from("alerts")
          .update({ 
            read_at: new Date().toISOString(),
            status: action === "schedule" ? "completed" : "read"
          })
          .eq("id", alertId);

        if (updateError) throw updateError;
      }

      if (action === "dismiss") {
        const { error: updateError } = await supabase
          .from("alerts")
          .update({ status: "dismissed" })
          .eq("id", alertId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-alerts"] });
    },
  });

  const handleSchedule = async (alert: any) => {
    await recordClick.mutateAsync({ alertId: alert.id, action: "schedule" });
    toast.success("Redirecionando para agendamento...");
    
    // Navigate to new appointment with alert context
    navigate("/novo-agendamento", {
      state: {
        fromAlert: true,
        alertId: alert.id,
        pendingItems: alert.pending_items,
        vehicleId: alert.vehicle_id,
      },
    });
  };

  const handleDismiss = async (alertId: string) => {
    await recordClick.mutateAsync({ alertId, action: "dismiss" });
    toast.info("Aviso dispensado");
  };

  const handleCall = async (alertId: string) => {
    await recordClick.mutateAsync({ alertId, action: "call" });
    // Open phone dialer
    window.location.href = "tel:+5511999999999";
  };

  const pendingAlerts = alerts?.filter(a => 
    a.status === "scheduled" || a.status === "sent"
  ) || [];
  
  const readAlerts = alerts?.filter(a => 
    a.status === "read" || a.status === "dismissed" || a.status === "completed"
  ) || [];

  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-4 overflow-y-auto pb-24">
        {/* Header Section */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Avisos</h1>
              <p className="text-sm text-muted-foreground">
                {pendingAlerts.length > 0 
                  ? `${pendingAlerts.length} aviso${pendingAlerts.length > 1 ? "s" : ""} pendente${pendingAlerts.length > 1 ? "s" : ""}`
                  : "Nenhum aviso pendente"
                }
              </p>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingAlerts.length === 0 && readAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Tudo em dia!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Você não tem avisos pendentes. Continue cuidando bem do seu veículo!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Alerts */}
            {pendingAlerts.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pendentes
                </h2>
                <div className="space-y-3">
                  {pendingAlerts.map((alert) => {
                    const Icon = alertIcons[alert.alert_type] || Bell;
                    const colorClass = alertColors[alert.alert_type] || "text-primary bg-primary/20";
                    const statusInfo = statusBadges[alert.status];
                    const pendingItems = alert.pending_items as any[] || [];

                    return (
                      <div
                        key={alert.id}
                        className="glass-card rounded-xl p-4 border-l-4 border-amber-500"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-foreground">{alert.title}</h3>
                              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusInfo.color)}>
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            {alert.message && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.message}
                              </p>
                            )}

                            {/* Pending Items List */}
                            {pendingItems.length > 0 && (
                              <div className="mt-2 p-2 bg-background/50 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Itens pendentes:</p>
                                <ul className="text-sm text-foreground space-y-1">
                                  {pendingItems.map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      {typeof item === "string" ? item : item.name || item.description}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Retorno sugerido: {format(new Date(alert.due_date), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                className="flex-1 gradient-primary text-primary-foreground"
                                onClick={() => handleSchedule(alert)}
                              >
                                <Calendar className="w-4 h-4 mr-1" />
                                Agendar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCall(alert.id)}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDismiss(alert.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Read/Past Alerts */}
            {readAlerts.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Histórico
                </h2>
                <div className="space-y-2">
                  {readAlerts.map((alert) => {
                    const Icon = alertIcons[alert.alert_type] || Bell;
                    const statusInfo = statusBadges[alert.status];

                    return (
                      <div
                        key={alert.id}
                        className="glass-card rounded-xl p-3 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.due_date), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusInfo.color)}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Avisos;
