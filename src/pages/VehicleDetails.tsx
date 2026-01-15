import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Wrench, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - será substituído por dados reais
const mockVehicle = {
  id: "1",
  brand: "VW",
  model: "Golf",
  plate: "BRA-2E19",
  year: "2020",
  color: "Branco",
  inService: true,
  lastService: "2024-01-10",
  totalServices: 3,
};

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

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
                  {mockVehicle.brand} {mockVehicle.model}
                </h2>
                <p className="text-muted-foreground">{mockVehicle.plate}</p>
              </div>
              {mockVehicle.inService && (
                <Badge variant="destructive" className="ml-auto">
                  Em serviço
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Ano</p>
                <p className="font-medium text-foreground">{mockVehicle.year}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cor</p>
                <p className="font-medium text-foreground">{mockVehicle.color}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockVehicle.totalServices}</p>
                <p className="text-xs text-muted-foreground">Serviços</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">10/01/24</p>
                <p className="text-xs text-muted-foreground">Último serviço</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {mockVehicle.inService && (
            <Button
              className="w-full h-14 rounded-xl"
              onClick={() => navigate(`/servico/${vehicleId}`)}
            >
              <FileText className="w-5 h-5 mr-2" />
              Ver Serviço Atual
            </Button>
          )}

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
