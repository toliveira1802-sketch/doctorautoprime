import { useMemo } from "react";
import { PatioItem, PatioStatus } from "@/hooks/useTrelloCards";
import { Car, Clock, AlertTriangle, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatioStatsProps {
  items: PatioItem[];
}

// Status labels for display
const statusLabels: Record<PatioStatus, string> = {
  diagnostico: "Diagnóstico",
  orcamento: "Orçamento",
  aguardando_aprovacao: "Aguard. Aprovação",
  aguardando_pecas: "Aguard. Peças",
  pronto_iniciar: "Pronto Iniciar",
  em_execucao: "Em Execução",
  pronto_retirada: "Pronto Retirada",
  concluido: "Entregue",
};

export function PatioStats({ items }: PatioStatsProps) {
  const stats = useMemo(() => {
    // Separate delivered from active vehicles
    const delivered = items.filter((item) => item.status === "concluido");
    const active = items.filter((item) => item.status !== "concluido");

    // Count by status (excluding delivered)
    const countByStatus: Record<PatioStatus, number> = {
      diagnostico: 0,
      orcamento: 0,
      aguardando_aprovacao: 0,
      aguardando_pecas: 0,
      pronto_iniciar: 0,
      em_execucao: 0,
      pronto_retirada: 0,
      concluido: delivered.length,
    };

    active.forEach((item) => {
      countByStatus[item.status]++;
    });

    // Find bottleneck (status with most vehicles, excluding delivered)
    let bottleneck: { status: PatioStatus; count: number } | null = null;
    const activeStatuses: PatioStatus[] = [
      "diagnostico",
      "orcamento",
      "aguardando_aprovacao",
      "aguardando_pecas",
      "pronto_iniciar",
      "em_execucao",
      "pronto_retirada",
    ];

    activeStatuses.forEach((status) => {
      if (!bottleneck || countByStatus[status] > bottleneck.count) {
        bottleneck = { status, count: countByStatus[status] };
      }
    });

    // Count delayed (vehicles waiting for approval or parts - these are typically delays)
    const delayed = active.filter(
      (item) =>
        item.status === "aguardando_aprovacao" ||
        item.status === "aguardando_pecas"
    ).length;

    // Vehicles in execution
    const inExecution = countByStatus.em_execucao;

    // Ready for pickup
    const readyForPickup = countByStatus.pronto_retirada;

    return {
      totalActive: active.length,
      delivered: delivered.length,
      delayed,
      inExecution,
      readyForPickup,
      bottleneck,
    };
  }, [items]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Active in Patio */}
      <StatCard
        icon={Car}
        label="No Pátio"
        value={stats.totalActive}
        color="text-primary"
        bgColor="bg-primary/10"
      />

      {/* In Execution */}
      <StatCard
        icon={TrendingUp}
        label="Em Execução"
        value={stats.inExecution}
        color="text-indigo-600"
        bgColor="bg-indigo-500/10"
      />

      {/* Ready for Pickup */}
      <StatCard
        icon={DollarSign}
        label="Pronto Retirada"
        value={stats.readyForPickup}
        color="text-amber-600"
        bgColor="bg-amber-500/10"
      />

      {/* Delayed */}
      <StatCard
        icon={AlertTriangle}
        label="Aguardando"
        value={stats.delayed}
        color="text-orange-600"
        bgColor="bg-orange-500/10"
        subtitle="Aprovação/Peças"
      />

      {/* Bottleneck */}
      {stats.bottleneck && stats.bottleneck.count > 0 && (
        <StatCard
          icon={Clock}
          label="Gargalo"
          value={stats.bottleneck.count}
          color="text-red-600"
          bgColor="bg-red-500/10"
          subtitle={statusLabels[stats.bottleneck.status]}
        />
      )}

      {/* Delivered - Pulsing Green Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border p-4",
          "bg-gradient-to-br from-emerald-500/20 to-green-500/10",
          "border-emerald-500/30",
          "animate-pulse"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent animate-shimmer" />
        <div className="relative flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-500">
              {stats.delivered}
            </p>
            <p className="text-xs text-emerald-600 font-medium">
              Entregues Hoje
            </p>
          </div>
        </div>
        {/* Decorative pulsing ring */}
        <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-emerald-500/20 animate-ping" />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  subtitle?: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div>
          <p className={cn("text-2xl font-bold", color)}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
