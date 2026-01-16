import { Car, FileText, Calendar, AlertTriangle, Clock, FileWarning } from "lucide-react";
import { PatioItem, PatioStatus } from "@/hooks/useTrelloCards";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// Required CRM fields by status
const requiredFieldsByStatus: Record<PatioStatus, string[]> = {
  diagnostico: ["service"],
  orcamento: ["service", "client"],
  aguardando_aprovacao: ["service", "client", "plate"],
  aguardando_pecas: ["service", "client", "plate"],
  pronto_iniciar: ["service", "client", "plate"],
  em_execucao: ["service", "client", "plate"],
  pronto_retirada: ["service", "client", "plate"],
  concluido: ["service", "client", "plate"],
};

const fieldLabels: Record<string, string> = {
  service: "Descrição do serviço",
  client: "Cliente",
  plate: "Placa",
};

// Check for missing CRM fields
function getMissingFields(item: PatioItem): string[] {
  const required = requiredFieldsByStatus[item.status] || [];
  const missing: string[] = [];

  if (required.includes("service") && (!item.service || item.service === "Sem descrição")) {
    missing.push("service");
  }
  if (required.includes("client") && (!item.client || item.client === "Sem cliente")) {
    missing.push("client");
  }
  if (required.includes("plate") && !item.plate) {
    missing.push("plate");
  }

  return missing;
}

export function PatioKanbanCard({ item, sla, onClick }: PatioKanbanCardProps) {
  const slaHours = parseSlaToHours(sla || "");
  const overdue = isOverdue(item.entryDate, slaHours);
  const missingFields = getMissingFields(item);
  const hasMissingCRM = missingFields.length > 0;

  return (
    <TooltipProvider>
      <div
        onClick={onClick}
        className={cn(
          "bg-card border rounded-lg p-3 cursor-pointer",
          "hover:shadow-md transition-all duration-200",
          "animate-fade-in relative",
          overdue 
            ? "border-destructive/60 bg-destructive/5 hover:border-destructive" 
            : hasMissingCRM
              ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
              : "border-border hover:border-primary/30"
        )}
      >
        {/* Status indicators */}
        <div className="absolute -top-1.5 -right-1.5 flex gap-1">
          {/* CRM incomplete indicator */}
          {hasMissingCRM && !overdue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <FileWarning className="w-3 h-3 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs font-medium">CRM Incompleto:</p>
                <ul className="text-xs mt-1">
                  {missingFields.map(field => (
                    <li key={field}>• {fieldLabels[field]}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Overdue indicator */}
          {overdue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-destructive-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">SLA ultrapassado ({sla})</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Both indicators when overdue AND missing CRM */}
          {overdue && hasMissingCRM && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <FileWarning className="w-3 h-3 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs font-medium">CRM Incompleto:</p>
                <ul className="text-xs mt-1">
                  {missingFields.map(field => (
                    <li key={field}>• {fieldLabels[field]}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="flex items-start gap-2 mb-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            overdue ? "bg-destructive/20" : hasMissingCRM ? "bg-amber-500/20" : "bg-primary/10"
          )}>
            <Car className={cn(
              "w-4 h-4", 
              overdue ? "text-destructive" : hasMissingCRM ? "text-amber-600" : "text-primary"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm truncate">
              {item.vehicle}
            </h4>
            {item.plate ? (
              <p className="text-xs text-muted-foreground font-mono">
                {item.plate}
              </p>
            ) : (
              <p className="text-xs text-amber-600 font-mono">
                Sem placa
              </p>
            )}
          </div>
        </div>

        {/* Client */}
        {item.client && item.client !== "Sem cliente" ? (
          <p className="text-xs text-muted-foreground mb-2 truncate">
            👤 {item.client}
          </p>
        ) : requiredFieldsByStatus[item.status]?.includes("client") && (
          <p className="text-xs text-amber-600 mb-2 truncate">
            ⚠️ Cliente não informado
          </p>
        )}

        {/* Service Description */}
        {item.service && item.service !== "Sem descrição" ? (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {item.service}
          </p>
        ) : requiredFieldsByStatus[item.status]?.includes("service") && (
          <p className="text-xs text-amber-600 mb-2">
            ⚠️ Serviço não descrito
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
          {item.osId && (
            <a
              href={`/admin/ordens-servico/${item.osId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Abrir Ordem de Serviço"
            >
              <FileText className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
