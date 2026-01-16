import { cn } from "@/lib/utils";

type StatusType = 
  | "received" 
  | "diagnosis" 
  | "pending" 
  | "executing" 
  | "ready" 
  | "completed"
  | "pendente"
  | "confirmado"
  | "cancelado"
  | "concluido"
  | "diagnostico"
  | "orcamento"
  | "aguardando_aprovacao"
  | "aguardando_pecas"
  | "pronto_iniciar"
  | "em_execucao"
  | "pronto_retirada";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; colors: string; icon: string }> = {
  // Legacy statuses
  received: {
    label: "Recebido",
    colors: "bg-secondary text-foreground border-border",
    icon: "📥",
  },
  diagnosis: {
    label: "Em Diagnóstico",
    colors: "bg-primary/20 text-primary border-primary/30",
    icon: "🧠",
  },
  pending: {
    label: "Aguardando Aprovação",
    colors: "bg-warning/20 text-warning border-warning/30",
    icon: "⏳",
  },
  executing: {
    label: "Em Execução",
    colors: "bg-primary/15 text-primary border-primary/25",
    icon: "🛠️",
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
  // Appointment statuses
  pendente: {
    label: "Pendente",
    colors: "bg-warning/20 text-warning border-warning/30",
    icon: "⏳",
  },
  confirmado: {
    label: "Confirmado",
    colors: "bg-primary/20 text-primary border-primary/30",
    icon: "✅",
  },
  cancelado: {
    label: "Cancelado",
    colors: "bg-destructive/20 text-destructive border-destructive/30",
    icon: "❌",
  },
  concluido: {
    label: "Concluído",
    colors: "bg-success/20 text-success border-success/30",
    icon: "🎉",
  },
  // New OS statuses with emojis for Trello
  diagnostico: {
    label: "🧠 Diagnóstico",
    colors: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    icon: "🧠",
  },
  orcamento: {
    label: "📝 Orçamento",
    colors: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    icon: "📝",
  },
  aguardando_aprovacao: {
    label: "🤔 Aguardando Aprovação",
    colors: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    icon: "🤔",
  },
  aguardando_pecas: {
    label: "😤 Aguardando Peças",
    colors: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    icon: "😤",
  },
  pronto_iniciar: {
    label: "🫵 Pronto para Iniciar",
    colors: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30",
    icon: "🫵",
  },
  em_execucao: {
    label: "🛠️🔩 Em Execução",
    colors: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
    icon: "🛠️",
  },
  pronto_retirada: {
    label: "💰 Pronto / Aguardando Retirada",
    colors: "bg-success/20 text-success border-success/30",
    icon: "💰",
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
