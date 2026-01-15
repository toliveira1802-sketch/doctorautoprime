import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone, MessageSquare, Eye, GripVertical, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type PatioStatus = 
  | "diagnostico"
  | "aguardando_pecas"
  | "pronto_iniciar"
  | "em_execucao"
  | "pronto_retirada"
  | "concluido";

interface PatioItem {
  id: string;
  client: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  status: PatioStatus;
  entryDate: string;
}

const mockPatioItems: PatioItem[] = [
  {
    id: "1",
    client: "João Silva",
    phone: "(11) 99999-1234",
    vehicle: "VW Polo",
    plate: "ABC-1234",
    service: "Troca de Óleo",
    status: "diagnostico",
    entryDate: "15/01/2026",
  },
  {
    id: "2",
    client: "Maria Santos",
    phone: "(11) 98888-5678",
    vehicle: "Fiat Argo",
    plate: "XYZ-5678",
    service: "Revisão Completa",
    status: "em_execucao",
    entryDate: "14/01/2026",
  },
  {
    id: "3",
    client: "Pedro Lima",
    phone: "(11) 97777-9012",
    vehicle: "Hyundai HB20",
    plate: "DEF-9012",
    service: "Diagnóstico Completo",
    status: "diagnostico",
    entryDate: "15/01/2026",
  },
  {
    id: "4",
    client: "Ana Costa",
    phone: "(11) 96666-3456",
    vehicle: "Toyota Corolla",
    plate: "GHI-3456",
    service: "Troca de Freios",
    status: "aguardando_pecas",
    entryDate: "13/01/2026",
  },
  {
    id: "5",
    client: "Carlos Mendes",
    phone: "(11) 95555-7890",
    vehicle: "Honda Civic",
    plate: "JKL-7890",
    service: "Suspensão",
    status: "pronto_iniciar",
    entryDate: "12/01/2026",
  },
  {
    id: "6",
    client: "Lucia Ferreira",
    phone: "(11) 94444-2345",
    vehicle: "Chevrolet Onix",
    plate: "MNO-2345",
    service: "Ar Condicionado",
    status: "pronto_retirada",
    entryDate: "10/01/2026",
  },
];

const statusColumns: { status: PatioStatus; label: string; icon: string; color: string; headerColor: string }[] = [
  { 
    status: "diagnostico", 
    label: "Diagnóstico", 
    icon: "🧠", 
    color: "border-purple-500/50",
    headerColor: "bg-purple-500/20 text-purple-400"
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
    label: "Pronto p/ Iniciar", 
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
    label: "Pronto Retirada", 
    icon: "💰", 
    color: "border-emerald-500/50",
    headerColor: "bg-emerald-500/20 text-emerald-400"
  },
  { 
    status: "concluido", 
    label: "Concluído", 
    icon: "✅", 
    color: "border-muted-foreground/50",
    headerColor: "bg-muted text-muted-foreground"
  },
];

const AdminPatio = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(mockPatioItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<PatioItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PatioStatus | null>(null);

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
      setItems((prev) =>
        prev.map((item) =>
          item.id === draggedItem.id ? { ...item, status: newStatus } : item
        )
      );
      
      const column = statusColumns.find((c) => c.status === newStatus);
      toast.success(`${draggedItem.vehicle} movido para ${column?.icon} ${column?.label}`);
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
              {items.length} veículos no pátio
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, veículo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
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
                                {item.vehicle}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.plate}
                              </p>
                            </div>
                          </div>

                          {/* Client */}
                          <div className="text-xs">
                            <p className="text-foreground truncate">{item.client}</p>
                            <p className="text-muted-foreground truncate">{item.service}</p>
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
                              onClick={() => {
                                window.open(`https://wa.me/55${item.phone.replace(/\D/g, "")}`, "_blank");
                              }}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {columnItems.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
                        Arraste um veículo aqui
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
