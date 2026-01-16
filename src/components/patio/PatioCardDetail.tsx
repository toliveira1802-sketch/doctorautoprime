import { PatioItem, PatioStatus } from "@/hooks/useTrelloCards";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Car,
  User,
  Calendar,
  ExternalLink,
  AlertTriangle,
  FileText,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatioCardDetailProps {
  item: PatioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define required CRM fields per status
const requiredFieldsByStatus: Record<PatioStatus, string[]> = {
  diagnostico: ["service"],
  orcamento: ["service", "client"],
  aguardando_aprovacao: ["service", "client"],
  aguardando_pecas: ["service", "client"],
  pronto_iniciar: ["service", "client"],
  em_execucao: ["service", "client"],
  pronto_retirada: ["service", "client"],
  concluido: ["service", "client"],
};

// Field labels for display
const fieldLabels: Record<string, string> = {
  service: "Descrição do serviço",
  client: "Nome do cliente",
  plate: "Placa do veículo",
};

// Status config for badge display
const statusConfig: Record<PatioStatus, { label: string; color: string }> = {
  diagnostico: { label: "Diagnóstico", color: "bg-purple-500/20 text-purple-600" },
  orcamento: { label: "Orçamento", color: "bg-blue-500/20 text-blue-600" },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-500/20 text-amber-600" },
  aguardando_pecas: { label: "Aguardando Peças", color: "bg-orange-500/20 text-orange-600" },
  pronto_iniciar: { label: "Pronto para Iniciar", color: "bg-cyan-500/20 text-cyan-600" },
  em_execucao: { label: "Em Execução", color: "bg-indigo-500/20 text-indigo-600" },
  pronto_retirada: { label: "Pronto / Retirada", color: "bg-green-500/20 text-green-600" },
  concluido: { label: "Entregue", color: "bg-emerald-500/20 text-emerald-600" },
};

function getMissingFields(item: PatioItem): string[] {
  const required = requiredFieldsByStatus[item.status] || [];
  const missing: string[] = [];

  required.forEach((field) => {
    if (field === "service" && (!item.service || item.service === "Sem descrição")) {
      missing.push(field);
    }
    if (field === "client" && (!item.client || item.client === "Sem cliente" || item.client === "")) {
      missing.push(field);
    }
    if (field === "plate" && !item.plate) {
      missing.push(field);
    }
  });

  return missing;
}

export function PatioCardDetail({ item, open, onOpenChange }: PatioCardDetailProps) {
  if (!item) return null;

  const missingFields = getMissingFields(item);
  const hasMissingFields = missingFields.length > 0;
  const statusInfo = statusConfig[item.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            {item.vehicle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* CRM Warning */}
          {hasMissingFields && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600">
                  CRM incompleto para esta etapa
                </p>
                <p className="text-xs text-amber-600/80 mt-1">
                  Campos pendentes:{" "}
                  {missingFields.map((f) => fieldLabels[f]).join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={cn("font-medium", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>

          <Separator />

          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Car className="w-4 h-4" />
                <span className="text-xs">Veículo</span>
              </div>
              <p className="font-medium">{item.vehicle}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="text-xs">Placa</span>
              </div>
              <p className={cn("font-mono font-medium", !item.plate && "text-muted-foreground italic")}>
                {item.plate || "Não informada"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="text-xs">Cliente</span>
              </div>
              <p className={cn("font-medium", (!item.client || item.client === "Sem cliente") && "text-muted-foreground italic")}>
                {item.client && item.client !== "Sem cliente" ? item.client : "Não informado"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Entrada</span>
              </div>
              <p className="font-medium">{item.entryDate || "—"}</p>
            </div>
          </div>

          <Separator />

          {/* Service Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs">Descrição do Serviço</span>
            </div>
            <p className={cn(
              "text-sm whitespace-pre-wrap",
              (!item.service || item.service === "Sem descrição") && "text-muted-foreground italic"
            )}>
              {item.service && item.service !== "Sem descrição" 
                ? item.service 
                : "Nenhuma descrição cadastrada"}
            </p>
          </div>

        {/* Actions */}
          {item.osId && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`/admin/ordens-servico/${item.osId}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Abrir Ordem de Serviço
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
