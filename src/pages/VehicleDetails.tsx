import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Wrench, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string;
  brand: string | null;
  model: string;
  plate: string;
  year: string | null;
  color: string | null;
}

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, brand, model, plate, year, color")
        .eq("id", vehicleId)
        .maybeSingle();

      if (error) throw error;
      setVehicle(data);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen gradient-bg dark flex flex-col">
        <header className="sticky top-0 z-40 pt-safe-top">
          <div className="flex items-center gap-4 px-4 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Veículo não encontrado</h1>
          </div>
        </header>
        <main className="flex-1 px-4 pb-8 flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Este veículo não foi encontrado</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Voltar ao início
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 pt-safe-top">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Detalhes do Veículo</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 space-y-6">
        {/* Vehicle Info Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {vehicle.brand || ''} {vehicle.model}
                </h2>
                <p className="text-muted-foreground">{vehicle.plate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Ano</p>
                <p className="font-medium text-foreground">{vehicle.year || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cor</p>
                <p className="font-medium text-foreground">{vehicle.color || "Não informada"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-14 rounded-xl glass-card border-0"
            onClick={() => navigate("/novo-agendamento")}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Serviço
          </Button>
        </div>
      </main>
    </div>
  );
}
