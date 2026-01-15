import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, Phone, Camera, FileText, Loader2 } from "lucide-react";
import { ServiceTimeline } from "@/components/service/ServiceTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Vehicle {
  id: string;
  model: string;
  brand: string | null;
  plate: string;
  year: string | null;
}

interface Appointment {
  id: string;
  appointment_date: string;
  estimated_completion: string | null;
  checklist_photos: string[] | null;
  notes: string | null;
  mechanic_notes: string | null;
  status: string;
}

const ServicoDetalhes = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!vehicleId) {
        setLoading(false);
        return;
      }

      try {
        // Buscar veículo
        const { data: vehicleData, error: vehicleError } = await supabase
          .from("vehicles")
          .select("id, model, brand, plate, year")
          .eq("id", vehicleId)
          .single();

        if (vehicleError) throw vehicleError;
        setVehicle(vehicleData);

        // Buscar agendamento ativo mais recente para este veículo
        const { data: appointmentData, error: appointmentError } = await supabase
          .from("appointments")
          .select("id, appointment_date, estimated_completion, checklist_photos, notes, mechanic_notes, status")
          .eq("vehicle_id", vehicleId)
          .in("status", ["pendente", "confirmado", "em_execucao"])
          .order("appointment_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!appointmentError && appointmentData) {
          setAppointment(appointmentData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen gradient-bg dark flex flex-col items-center justify-center p-6">
        <Car className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Veículo não encontrado</h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const checklistPhotos = appointment?.checklist_photos || [];

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

            {appointment && (
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Entrada</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Previsão</p>
                  <p className="font-medium text-foreground">
                    {appointment.estimated_completion
                      ? format(new Date(appointment.estimated_completion), "dd/MM/yyyy", { locale: ptBR })
                      : "A definir"}
                  </p>
                </div>
              </div>
            )}
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

        {/* Notes/Observations */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">
              {appointment?.mechanic_notes || appointment?.notes || "Nenhuma observação registrada."}
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
