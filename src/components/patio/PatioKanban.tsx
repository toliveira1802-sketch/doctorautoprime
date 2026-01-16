import { useMemo } from "react";
import { PatioItem, PatioStatus, useTrelloCards } from "@/hooks/useTrelloCards";
import { PatioKanbanColumn } from "./PatioKanbanColumn";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

// Column configuration with visual styles
const columnConfig: Record<
  PatioStatus,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  diagnostico: {
    label: "Diagnóstico",
    icon: "🧠",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  orcamento: {
    label: "Orçamento",
    icon: "📝",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  aguardando_aprovacao: {
    label: "Aguardando Aprovação",
    icon: "🤔",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  aguardando_pecas: {
    label: "Aguardando Peças",
    icon: "😤",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
  pronto_iniciar: {
    label: "Pronto para Iniciar",
    icon: "🫵",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
  },
  em_execucao: {
    label: "Em Execução",
    icon: "🛠️",
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
  },
  pronto_retirada: {
    label: "Pronto / Retirada",
    icon: "💰",
    color: "text-success",
    bgColor: "bg-success/10 border-success/20",
  },
  concluido: {
    label: "Entregue",
    icon: "🙏🏻",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
};

// Order of columns
const columnOrder: PatioStatus[] = [
  "diagnostico",
  "orcamento",
  "aguardando_aprovacao",
  "aguardando_pecas",
  "pronto_iniciar",
  "em_execucao",
  "pronto_retirada",
  "concluido",
];

export function PatioKanban() {
  const { items, isLoading, error, refresh } = useTrelloCards();
  const navigate = useNavigate();

  // Group items by status
  const groupedItems = useMemo(() => {
    const groups: Record<PatioStatus, PatioItem[]> = {
      diagnostico: [],
      orcamento: [],
      aguardando_aprovacao: [],
      aguardando_pecas: [],
      pronto_iniciar: [],
      em_execucao: [],
      pronto_retirada: [],
      concluido: [],
    };

    items.forEach((item) => {
      if (groups[item.status]) {
        groups[item.status].push(item);
      }
    });

    return groups;
  }, [items]);

  const handleCardClick = (item: PatioItem) => {
    navigate(`/admin/patio/${item.trelloCardId}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnOrder.slice(0, 5).map((status) => (
          <div
            key={status}
            className="flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-xl border border-border"
          >
            <div className="px-4 py-3 border-b">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-3 space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {columnOrder.map((status) => (
          <PatioKanbanColumn
            key={status}
            status={status}
            items={groupedItems[status]}
            config={columnConfig[status]}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
