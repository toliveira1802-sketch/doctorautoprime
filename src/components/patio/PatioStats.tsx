import { useMemo } from "react";
import { PatioItem } from "@/hooks/useTrelloCards";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatioStatsProps {
  items: PatioItem[];
}

export function PatioStats({ items }: PatioStatsProps) {
  const stats = useMemo(() => {
    const delivered = items.filter((item) => item.status === "concluido");
    return {
      delivered: delivered.length,
    };
  }, [items]);

  if (stats.delivered === 0) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 w-fit",
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
      <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-emerald-500/20 animate-ping" />
    </div>
  );
}
