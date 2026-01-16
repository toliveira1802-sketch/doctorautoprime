import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatioStatus } from "@/hooks/useTrelloCards";

interface PatioFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: PatioStatus | "all";
  onStatusChange: (value: PatioStatus | "all") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const statusOptions: { value: PatioStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "diagnostico", label: "🧠 Diagnóstico" },
  { value: "orcamento", label: "📝 Orçamento" },
  { value: "aguardando_aprovacao", label: "🤔 Aguardando Aprovação" },
  { value: "aguardando_pecas", label: "😤 Aguardando Peças" },
  { value: "pronto_iniciar", label: "🫵 Pronto para Iniciar" },
  { value: "em_execucao", label: "🛠️ Em Execução" },
  { value: "pronto_retirada", label: "💰 Pronto / Retirada" },
  { value: "concluido", label: "🙏🏻 Entregue" },
];

export function PatioFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: PatioFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa, cliente ou veículo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as PatioStatus | "all")}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
