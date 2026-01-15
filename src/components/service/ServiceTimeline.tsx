import { useState, useEffect } from "react";
import { Check, Clock, Wrench, AlertCircle, CarFront, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type StepStatus = "completed" | "current" | "upcoming";

interface TimelineStep {
  id: string;
  title: string;
  status: StepStatus;
  time?: string;
  details?: string[];
  icon: React.ElementType;
}

interface ServiceTimelineProps {
  appointmentId?: string;
}

const statusToStep: Record<string, number> = {
  pendente: 0,
  confirmado: 1,
  em_execucao: 2,
  aguardando_pecas: 2,
  pronto_retirada: 3,
  concluido: 4,
  cancelado: -1,
};

export function ServiceTimeline({ appointmentId }: ServiceTimelineProps) {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [appointmentData, setAppointmentData] = useState<{
    status: string;
    mechanic_name?: string;
    created_at?: string;
  } | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        // Buscar último agendamento do usuário
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("appointments")
          .select("id, status, created_at, mechanic_id, mechanics(name)")
          .eq("user_id", user.id)
          .in("status", ["pendente", "confirmado", "em_execucao", "aguardando_pecas", "pronto_retirada"])
          .order("appointment_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setCurrentStep(statusToStep[data.status] ?? 0);
          setAppointmentData({
            status: data.status,
            mechanic_name: (data.mechanics as any)?.name,
            created_at: data.created_at,
          });
        }
      }
      setLoading(false);
    };

    fetchAppointment();
  }, [appointmentId]);

  const getStepStatus = (stepIndex: number): StepStatus => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "upcoming";
  };

  const steps: TimelineStep[] = [
    {
      id: "received",
      title: "Recebido",
      status: getStepStatus(0),
      time: appointmentData?.created_at 
        ? new Date(appointmentData.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        : undefined,
      details: getStepStatus(0) === "completed" ? ["Agendamento confirmado"] : undefined,
      icon: CarFront,
    },
    {
      id: "diagnosis",
      title: "Em Diagnóstico",
      status: getStepStatus(1),
      details: appointmentData?.mechanic_name && getStepStatus(1) !== "upcoming"
        ? [`Mecânico: ${appointmentData.mechanic_name}`]
        : undefined,
      icon: Wrench,
    },
    {
      id: "pending",
      title: "Aguardando Aprovação",
      status: getStepStatus(2),
      icon: AlertCircle,
    },
    {
      id: "executing",
      title: "Em Execução",
      status: getStepStatus(3),
      icon: Wrench,
    },
    {
      id: "ready",
      title: "Pronto para Retirada",
      status: getStepStatus(4),
      icon: Check,
    },
  ];

  const statusStyles: Record<StepStatus, { dot: string; line: string; text: string }> = {
    completed: {
      dot: "bg-success border-success",
      line: "bg-success",
      text: "text-foreground",
    },
    current: {
      dot: "bg-primary border-primary status-pulse",
      line: "bg-border",
      text: "text-foreground",
    },
    upcoming: {
      dot: "bg-muted border-border",
      line: "bg-border",
      text: "text-muted-foreground",
    },
  };

  if (loading) {
    return (
      <div className="glass-card p-5 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-slide-up">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Linha do Tempo
      </h2>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const styles = statusStyles[step.status];
          const isLast = index === steps.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300",
                    styles.dot
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="w-5 h-5 text-success-foreground" />
                  ) : (
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        step.status === "current"
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-full min-h-[60px] -mt-1",
                      step.status === "completed" ? "bg-success" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex-1 pb-6", !isLast && "min-h-[80px]")}>
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-medium", styles.text)}>
                    {step.title}
                  </h3>
                  {step.time && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {step.time}
                    </span>
                  )}
                </div>

                {step.details && step.details.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        {step.status === "completed" ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : step.status === "current" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        )}
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
