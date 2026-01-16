import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PatioItem, PatioStatus, useTrelloCards } from "@/hooks/useTrelloCards";
import { DroppableColumn } from "./DroppableColumn";
import { PatioKanbanCard } from "./PatioKanbanCard";
import { PatioFilters } from "./PatioFilters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  
  // Local state for optimistic updates
  const [localItems, setLocalItems] = useState<PatioItem[]>([]);
  const [activeItem, setActiveItem] = useState<PatioItem | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatioStatus | "all">("all");

  // Sync local items with fetched items
  useMemo(() => {
    if (items.length > 0) {
      setLocalItems(items);
    }
  }, [items]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter items based on search and status
  const filteredItems = useMemo(() => {
    return localItems.filter((item) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        item.plate.toLowerCase().includes(searchLower) ||
        item.client.toLowerCase().includes(searchLower) ||
        item.vehicle.toLowerCase().includes(searchLower) ||
        item.service.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [localItems, searchTerm, statusFilter]);

  // Group filtered items by status
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

    filteredItems.forEach((item) => {
      if (groups[item.status]) {
        groups[item.status].push(item);
      }
    });

    return groups;
  }, [filteredItems]);

  const handleCardClick = (item: PatioItem) => {
    navigate(`/admin/patio/${item.trelloCardId}`);
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = localItems.find((item) => item.id === active.id);
    if (draggedItem) {
      setActiveItem(draggedItem);
    }
  }, [localItems]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the item being dragged
    const draggedItem = localItems.find((item) => item.id === activeId);
    if (!draggedItem) return;

    // Determine target status
    let targetStatus: PatioStatus | null = null;

    // Check if dropped on a column
    if (columnOrder.includes(overId as PatioStatus)) {
      targetStatus = overId as PatioStatus;
    } else {
      // Dropped on another card, find its status
      const targetItem = localItems.find((item) => item.id === overId);
      if (targetItem) {
        targetStatus = targetItem.status;
      }
    }

    // If status changed, update locally (optimistic update)
    if (targetStatus && targetStatus !== draggedItem.status) {
      setLocalItems((prev) =>
        prev.map((item) =>
          item.id === activeId ? { ...item, status: targetStatus } : item
        )
      );

      // Show toast with status change info
      const fromLabel = columnConfig[draggedItem.status].label;
      const toLabel = columnConfig[targetStatus].label;
      toast.success(`${draggedItem.vehicle} movido`, {
        description: `${fromLabel} → ${toLabel}`,
      });

      // TODO: Implement API call to update Trello card status
      // For now, this is just a visual change
    }
  }, [localItems]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

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

  if (isLoading && localItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <PatioFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results count when filtering */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} veículo{filteredItems.length !== 1 ? "s" : ""}{" "}
          encontrado{filteredItems.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Kanban Board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {columnOrder.map((status) => (
              <DroppableColumn
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="opacity-90 shadow-xl rotate-3">
              <PatioKanbanCard item={activeItem} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
