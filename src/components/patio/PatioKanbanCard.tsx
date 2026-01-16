import { Car, ExternalLink, Calendar, AlertTriangle, Clock } from "lucide-react";
import { PatioItem } from "@/hooks/useTrelloCards";
import { cn } from "@/lib/utils";

interface PatioKanbanCardProps {
  item: PatioItem;
  sla?: string;
  onClick?: () => void;
}

// Parse SLA string to hours
function parseSlaToHours(sla: string): number | null {
  if (!sla || sla === "Combinado" || sla === "") return null;
  const match = sla.match(/^(\d+)h?$/);
  return match ? parseInt(match[1], 10) : null;
}

// Check if card is overdue based on entry date and SLA
function isOverdue(entryDate: string, slaHours: number | null): boolean {
  if (slaHours === null || !entryDate) return false;
  
  // Parse entry date (format: DD/MM/YYYY)
  const parts = entryDate.split("/");
  if (parts.length !== 3) return false;
  
  const [day, month, year] = parts.map(Number);
  const entryDateObj = new Date(year, month - 1, day);
  const now = new Date();
  
  const diffMs = now.getTime() - entryDateObj.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours > slaHours;
}

export function PatioKanbanCard({ item, sla, onClick }: PatioKanbanCardProps) {
  const slaHours = parseSlaToHours(sla || "");
  const overdue = isOverdue(item.entryDate, slaHours);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg p-3 cursor-pointer",
        "hover:shadow-md transition-all duration-200",
        "animate-fade-in relative",
        overdue 
          ? "border-destructive/60 bg-destructive/5 hover:border-destructive" 
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Overdue indicator */}
      {overdue && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center shadow-md animate-pulse">
          <AlertTriangle className="w-3 h-3 text-destructive-foreground" />
        </div>
      )}

      {/* Vehicle Info */}
      <div className="flex items-start gap-2 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          overdue ? "bg-destructive/20" : "bg-primary/10"
        )}>
          <Car className={cn("w-4 h-4", overdue ? "text-destructive" : "text-primary")} />
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
        <div className={cn(
          "flex items-center gap-1 text-xs",
          overdue ? "text-destructive font-medium" : "text-muted-foreground"
        )}>
          {overdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          <span>{item.entryDate}</span>
          {overdue && sla && (
            <span className="ml-1">({sla})</span>
          )}
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
