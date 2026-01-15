import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, Phone, Camera, FileText } from "lucide-react";
import { ServiceTimeline } from "@/components/service/ServiceTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServicoDetalhes = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  // Mock data - será substituído por dados reais do banco
  const vehicle = {
    id: vehicleId,
    model: "Civic",
    brand: "Honda",
    plate: "ABC-1234",
    year: "2022",
  };

  const service = {
    status: "diagnosis" as const,
    checkin_date: "15/01/2025",
    estimated_completion: "17/01/2025",
    mechanic: "João Silva",
  };

  // Mock fotos do checklist
  const checklistPhotos = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];

  return (
    <div className="min-h-screen gradient-bg dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Detalhes do Serviço</h1>
            <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 pb-24">
        {/* Vehicle Info Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year} • {vehicle.plate}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Entrada</p>
                <p className="font-medium text-foreground">{service.checkin_date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Previsão</p>
                <p className="font-medium text-foreground">{service.estimated_completion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <ServiceTimeline />

        {/* Checklist Photos */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Fotos do Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {checklistPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {checklistPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl overflow-hidden bg-muted"
                  >
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma foto disponível ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes/Observations - simplified for client */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">
              Veículo recebido em bom estado. Diagnóstico em andamento.
            </p>
          </CardContent>
        </Card>

        {/* Contact Button */}
        <Button
          className="w-full gradient-primary text-primary-foreground"
          size="lg"
          onClick={() => window.open("tel:+5511999999999")}
        >
          <Phone className="w-5 h-5 mr-2" />
          Falar com a Oficina
        </Button>
      </main>
    </div>
  );
};

export default ServicoDetalhes;
