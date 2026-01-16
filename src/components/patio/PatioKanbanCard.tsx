import { Car, ExternalLink, Calendar } from "lucide-react";
import { PatioItem, PatioStatus } from "@/hooks/useTrelloCards";
import { cn } from "@/lib/utils";

interface PatioKanbanCardProps {
  item: PatioItem;
  onClick?: () => void;
}

export function PatioKanbanCard({ item, onClick }: PatioKanbanCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-lg p-3 cursor-pointer",
        "hover:shadow-md hover:border-primary/30 transition-all duration-200",
        "animate-fade-in"
      )}
    >
      {/* Vehicle Info */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Car className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate">
            {item.vehicle}
          </h4>
          {item.plate && (
            <p className="text-xs text-muted-foreground font-mono">
              {item.plate}
            </p>
          )}
        </div>
      </div>

      {/* Client */}
      {item.client && item.client !== "Sem cliente" && (
        <p className="text-xs text-muted-foreground mb-2 truncate">
          👤 {item.client}
        </p>
      )}

      {/* Service Description */}
      {item.service && item.service !== "Sem descrição" && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {item.service}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{item.entryDate}</span>
        </div>
        {item.trelloUrl && (
          <a
            href={item.trelloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
