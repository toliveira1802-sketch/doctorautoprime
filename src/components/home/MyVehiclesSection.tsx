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
    brand: "Volkswagen",
    inService: true,
  },
];

export function MyVehiclesSection() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const hasVehicleInService = mockVehicles.some((v) => v.inService);

  return (
    <section className="animate-fade-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between h-14 px-4 glass-card rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Car className="w-5 h-5 text-muted-foreground" />
                {hasVehicleInService && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
                )}
              </div>
              <span className="font-medium text-foreground">Meus Veículos</span>
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-2 space-y-2 pl-2">
            {mockVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                  "bg-muted/30 hover:bg-muted/50",
                  vehicle.inService && "border-l-2 border-destructive"
                )}
                onClick={() => vehicle.inService && navigate(`/servico/${vehicle.id}`)}
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

                {vehicle.inService && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive font-medium">
                      Em serviço
                    </span>
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  </div>
                )}
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
