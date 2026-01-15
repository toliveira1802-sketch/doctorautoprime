import { useNavigate } from "react-router-dom";
import { Car, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VehicleInService {
  id: string;
  model: string;
  plate: string;
  status: "received" | "diagnosis" | "pending" | "executing" | "ready";
}

// Mock data - será substituído por dados reais
const vehiclesInService: VehicleInService[] = [
  {
    id: "1",
    model: "Honda Civic",
    plate: "ABC-1234",
    status: "diagnosis",
  },
];

const statusLabels: Record<VehicleInService["status"], string> = {
  received: "Recebido",
  diagnosis: "Em Diagnóstico",
  pending: "Aguardando Aprovação",
  executing: "Em Execução",
  ready: "Pronto",
};

export function MyVehiclesSection() {
  const navigate = useNavigate();

  // Só renderiza se tiver veículos em serviço
  if (vehiclesInService.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Car className="w-4 h-4" />
        Meus Veículos
      </h3>
      
      <div className="space-y-3">
        {vehiclesInService.map((vehicle) => (
          <Card
            key={vehicle.id}
            className="glass-card border-0 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate(`/servico/${vehicle.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Indicator dot - red when in service */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Car className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">{vehicle.plate}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium">
                    {statusLabels[vehicle.status]}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
