import { cn } from "@/lib/utils";

type StatusType = "received" | "diagnosis" | "pending" | "executing" | "ready" | "completed";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; colors: string; icon: string }> = {
  received: {
    label: "Recebido",
    colors: "bg-primary/20 text-primary border-primary/30",
    icon: "📥",
  },
  diagnosis: {
    label: "Em Diagnóstico",
    colors: "bg-warning/20 text-warning border-warning/30",
    icon: "🔍",
  },
  pending: {
    label: "Aguardando Aprovação",
    colors: "bg-violet/20 text-violet border-violet/30",
    icon: "⏳",
  },
  executing: {
    label: "Em Execução",
    colors: "bg-brand-light/20 text-brand-light border-brand-light/30",
    icon: "🔧",
  },
  ready: {
    label: "Pronto para Retirada",
    colors: "bg-success/20 text-success border-success/30",
    icon: "✅",
  },
  completed: {
    label: "Concluído",
    colors: "bg-success/20 text-success border-success/30",
    icon: "🎉",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border",
        config.colors,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
