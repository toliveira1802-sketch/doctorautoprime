import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PatioItem } from "@/hooks/useTrelloCards";
import { PatioKanbanCard } from "./PatioKanbanCard";
import { cn } from "@/lib/utils";

interface DraggableCardProps {
  item: PatioItem;
  sla?: string;
  onClick?: () => void;
}

export function DraggableCard({ item, sla, onClick }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "card",
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-manipulation",
        isDragging && "opacity-50 z-50"
      )}
    >
      <PatioKanbanCard item={item} sla={sla} onClick={onClick} />
    </div>
  );
}
