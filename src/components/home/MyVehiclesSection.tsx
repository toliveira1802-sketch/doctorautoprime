import { useNavigate } from "react-router-dom";
import { Car, ChevronDown, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AddVehicleDialog } from "@/components/vehicle/AddVehicleDialog";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  brand: string | null;
}

export function MyVehiclesSection() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vehicles")
        .select("id, model, plate, brand")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ is_active: false })
        .eq("id", vehicleId);

      if (error) throw error;
      
      toast.success("Veículo removido com sucesso!");
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Erro ao remover veículo");
    }
  };

  const vehicleSummary = vehicles.map((v) => `${v.brand || ''} ${v.model}`.trim()).join(", ");

  if (loading) {
    return (
      <section className="animate-fade-in">
        <div className="flex items-center justify-center p-4 glass-card rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 glass-card rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">MEUS VEÍCULOS</p>
                <p className="text-sm text-muted-foreground">
                  {vehicles.length > 0 
                    ? `${vehicles.length} veículo${vehicles.length > 1 ? 's' : ''}`
                    : "Nenhum veículo"
                  }
                </p>
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
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ml-4",
                  "bg-muted/20 hover:bg-muted/40 border border-border/50"
                )}
                onClick={() => navigate(`/veiculo/${vehicle.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Car className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {vehicle.brand || ''} {vehicle.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover {vehicle.brand || ''} {vehicle.model} ({vehicle.plate}) da sua lista?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDeleteVehicle(vehicle.id, e)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}

            {/* Botão para adicionar veículo */}
            <div className="ml-4">
              <AddVehicleDialog 
                onVehicleAdded={fetchVehicles}
                trigger={
                  <button className="w-full p-3 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Adicionar veículo</span>
                  </button>
                }
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
