import { PatioItem, PatioStatus } from "@/hooks/useTrelloCards";
import { PatioKanbanCard } from "./PatioKanbanCard";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PatioKanbanColumnProps {
  status: PatioStatus;
  items: PatioItem[];
  config: {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
  };
  onCardClick?: (item: PatioItem) => void;
}

export function PatioKanbanColumn({
  status,
  items,
  config,
  onCardClick,
}: PatioKanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-xl border border-border">
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-t-xl border-b",
          config.bgColor
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <h3 className={cn("font-semibold text-sm", config.color)}>
            {config.label}
          </h3>
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
      <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
        <div className="p-3 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum veículo
            </div>
          ) : (
            items.map((item) => (
              <PatioKanbanCard
                key={item.id}
                item={item}
                onClick={() => onCardClick?.(item)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
