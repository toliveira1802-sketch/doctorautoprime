import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PatioItem, PatioStatus } from "@/hooks/useTrelloCards";
import { DraggableCard } from "./DraggableCard";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DroppableColumnProps {
  status: PatioStatus;
  items: PatioItem[];
  config: {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    sla: string;
  };
  onCardClick?: (item: PatioItem) => void;
}

export function DroppableColumn({
  status,
  items,
  config,
  onCardClick,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  const itemIds = items.map((item) => item.id);

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-xl border border-border transition-all duration-200",
        isOver && "ring-2 ring-primary/50 border-primary/30 bg-primary/5"
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-t-xl border-b",
          config.bgColor
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <div>
            <h3 className={cn("font-semibold text-sm", config.color)}>
              {config.label}
            </h3>
            {config.sla && (
              <p className="text-[10px] text-muted-foreground">
                SLA: {config.sla}
              </p>
            )}
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            config.bgColor,
            config.color
          )}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-320px)]">
        <div ref={setNodeRef} className="p-3 space-y-3 min-h-[100px]">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {items.length === 0 ? (
              <div className={cn(
                "text-center py-8 text-muted-foreground text-sm rounded-lg border-2 border-dashed border-border transition-colors",
                isOver && "border-primary/50 bg-primary/5"
              )}>
                {isOver ? "Solte aqui" : "Nenhum veículo"}
              </div>
            ) : (
              items.map((item) => (
                <DraggableCard
                  key={item.id}
                  item={item}
                  onClick={() => onCardClick?.(item)}
                />
              ))
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
