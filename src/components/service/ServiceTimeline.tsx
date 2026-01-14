import { Check, Clock, Wrench, AlertCircle, CarFront, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "current" | "upcoming";

interface TimelineStep {
  id: string;
  title: string;
  status: StepStatus;
  time?: string;
  details?: string[];
  icon: React.ElementType;
}

const steps: TimelineStep[] = [
  {
    id: "received",
    title: "Recebido",
    status: "completed",
    time: "10:30",
    details: ["Checklist enviado", "Confirmado por você"],
    icon: CarFront,
  },
  {
    id: "diagnosis",
    title: "Em Diagnóstico",
    status: "current",
    time: "11:15",
    details: ["Mecânico: João Silva", "Iniciado há 45min"],
    icon: Wrench,
  },
  {
    id: "pending",
    title: "Aguardando Aprovação",
    status: "upcoming",
    icon: AlertCircle,
  },
  {
    id: "executing",
    title: "Em Execução",
    status: "upcoming",
    icon: Wrench,
  },
  {
    id: "ready",
    title: "Pronto para Retirada",
    status: "upcoming",
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

export function ServiceTimeline() {
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
