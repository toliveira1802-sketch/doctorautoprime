import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, Eye, GripVertical, Car, RefreshCw, ExternalLink, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrelloCards, PatioStatus, PatioItem } from "@/hooks/useTrelloCards";

const statusColumns: { status: PatioStatus; label: string; icon: string; color: string; headerColor: string }[] = [
  { 
    status: "diagnostico", 
    label: "Diagnóstico", 
    icon: "🧠", 
    color: "border-purple-500/50",
    headerColor: "bg-purple-500/20 text-purple-400"
  },
  { 
    status: "orcamento", 
    label: "Orçamento", 
    icon: "📝", 
    color: "border-cyan-500/50",
    headerColor: "bg-cyan-500/20 text-cyan-400"
  },
  { 
    status: "aguardando_aprovacao", 
    label: "Aguardando Aprovação", 
    icon: "🤔", 
    color: "border-yellow-500/50",
    headerColor: "bg-yellow-500/20 text-yellow-400"
  },
  { 
    status: "aguardando_pecas", 
    label: "Aguardando Peças", 
    icon: "😤", 
    color: "border-orange-500/50",
    headerColor: "bg-orange-500/20 text-orange-400"
  },
  { 
    status: "pronto_iniciar", 
    label: "Pronto para Iniciar", 
    icon: "🫵", 
    color: "border-blue-500/50",
    headerColor: "bg-blue-500/20 text-blue-400"
  },
  { 
    status: "em_execucao", 
    label: "Em Execução", 
    icon: "🛠️", 
    color: "border-amber-500/50",
    headerColor: "bg-amber-500/20 text-amber-400"
  },
  { 
    status: "pronto_retirada", 
    label: "Pronto / Aguardando Retirada", 
    icon: "💰", 
    color: "border-emerald-500/50",
    headerColor: "bg-emerald-500/20 text-emerald-400"
  },
  { 
    status: "concluido", 
    label: "Entregue", 
    icon: "🙏🏻", 
    color: "border-muted-foreground/50",
    headerColor: "bg-muted text-muted-foreground"
  },
];

const AdminPatio = () => {
  const navigate = useNavigate();
  const { items, isLoading, error, refresh } = useTrelloCards();
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<PatioItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PatioStatus | null>(null);

  // Excluir veículos entregues da contagem principal
  const activeItems = items.filter((item) => item.status !== "concluido");

  const filteredItems = items.filter((item) =>
    item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemsByStatus = (status: PatioStatus) =>
    filteredItems.filter((item) => item.status === status);

  const handleDragStart = (e: React.DragEvent, item: PatioItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: PatioStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: PatioStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedItem && draggedItem.status !== newStatus) {
      // Por enquanto só mostra toast - futuramente vai atualizar no Trello
      const column = statusColumns.find((c) => c.status === newStatus);
      toast.info(
        `Para mover "${draggedItem.plate}" para ${column?.label}, use o Trello diretamente.`,
        {
          action: {
            label: "Abrir Trello",
            onClick: () => window.open(draggedItem.trelloUrl, "_blank"),
          },
        }
      );
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/patio/${id}`);
  };

  const handleRefresh = () => {
    refresh();
    toast.success("Atualizando dados do Trello...");
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Car className="w-6 h-6 text-primary" />
                Pátio
              </h1>
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-72 shrink-0">
                <Skeleton className="h-12 w-full mb-2 rounded-t-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              Pátio
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeItems.length} veículos no pátio • Sincronizado com Trello
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              className="gradient-primary text-primary-foreground"
              onClick={() => navigate("/admin/nova-os")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar OS
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, veículo ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <ScrollArea className="flex-1 w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            {statusColumns.map((column) => {
              const columnItems = getItemsByStatus(column.status);
              const isDropTarget = dragOverColumn === column.status;

              return (
                <div
                  key={column.status}
                  className={cn(
                    "w-72 shrink-0 flex flex-col rounded-xl border-2 transition-all duration-200",
                    column.color,
                    isDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onDragOver={(e) => handleDragOver(e, column.status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  {/* Column Header */}
                  <div className={cn(
                    "px-4 py-3 rounded-t-lg font-medium flex items-center justify-between",
                    column.headerColor
                  )}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{column.icon}</span>
                      <span className="text-sm">{column.label}</span>
                    </span>
                    <span className="text-xs bg-background/30 px-2 py-0.5 rounded-full">
                      {columnItems.length}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 p-2 space-y-2 min-h-[200px] bg-background/30">
                    {columnItems.map((item) => (
                      <Card
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab active:cursor-grabbing transition-all duration-200 border-none",
                          "bg-card/80 backdrop-blur-sm hover:bg-card hover:shadow-lg",
                          draggedItem?.id === item.id && "opacity-50 scale-95"
                        )}
                      >
                        <CardContent className="p-3 space-y-2">
                          {/* Drag Handle & Vehicle */}
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">
                                {item.plate}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.vehicle}
                              </p>
                            </div>
                          </div>

                          {/* Client & Service */}
                          <div className="text-xs">
                            <p className="text-foreground truncate font-medium">{item.client}</p>
                            <p className="text-muted-foreground truncate line-clamp-2">
                              {item.service}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 flex-1 text-xs"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => window.open(item.trelloUrl, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {columnItems.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
                        Nenhum veículo
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </AdminLayout>
  );
};

export default AdminPatio;
