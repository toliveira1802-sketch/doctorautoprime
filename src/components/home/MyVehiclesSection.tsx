import { useNavigate } from "react-router-dom";
import { Car, ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  brand: string;
  inService: boolean;
}

// Mock data - será substituído por dados reais do Supabase
const mockVehicles: Vehicle[] = [
  {
    id: "1",
    model: "Golf",
    plate: "BRA-2E19",
    brand: "VW",
    inService: true,
  },
];

export function MyVehiclesSection() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const hasVehicleInService = mockVehicles.some((v) => v.inService);
  const vehicleSummary = mockVehicles.map((v) => `${v.brand} ${v.model}`).join(", ");

  return (
    <section className="animate-fade-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 glass-card rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
                {hasVehicleInService && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">MEUS VEÍCULOS</p>
                <p className="text-sm text-muted-foreground">{vehicleSummary || "Nenhum veículo"}</p>
              </div>
            </div>
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-2 space-y-2">
            {mockVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ml-4",
                  "bg-muted/20 hover:bg-muted/40 border border-border/50",
                  vehicle.inService && "border-l-4 border-l-destructive"
                )}
                onClick={() => navigate(`/veiculo/${vehicle.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Car className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {vehicle.inService && (
                    <>
                      <span className="text-xs text-destructive font-medium">
                        Em serviço
                      </span>
                      <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    </>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}

            {mockVehicles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum veículo cadastrado
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
