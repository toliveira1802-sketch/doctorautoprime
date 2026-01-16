import { AdminLayout } from "@/components/layout/AdminLayout";
import { PatioKanban } from "@/components/patio/PatioKanban";
import { PatioStats } from "@/components/patio/PatioStats";
import { useTrelloCards } from "@/hooks/useTrelloCards";
import { Car, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPatio() {
  const { refresh, isLoading, items } = useTrelloCards();

  // Count only active vehicles (excluding delivered)
  const activeCount = items.filter((item) => item.status !== "concluido").length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              Pátio
            </h1>
            <p className="text-muted-foreground">
              {activeCount} veículo{activeCount !== 1 ? "s" : ""} ativos no pátio
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <PatioStats items={items} />

        {/* Kanban Board */}
        <PatioKanban />
      </div>
    </AdminLayout>
  );
}
