import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, Car, Check, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentData {
  id: string;
  vehicleModel: string;
  vehiclePlate: string;
  service: string;
  currentDate: Date;
  currentTime: string | null;
  isFullDay: boolean;
}

interface LocationState {
  appointment: AppointmentData;
}

// Horários disponíveis (serão buscados do backend no futuro)
const morningSlots = ["08:00", "09:00", "10:00", "11:00"];
const afternoonSlots = ["13:00", "14:00", "15:00", "16:00", "17:00"];
const allTimeSlots = [...morningSlots, ...afternoonSlots];

const Reagendamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const appointment = state?.appointment;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datas disponíveis (próximos 30 dias, excluindo domingos)
  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = addDays(today, 30);
    
    // Não permitir domingos
    if (date.getDay() === 0) return false;
    
    // Não permitir datas passadas ou a data atual do agendamento
    if (date < today) return false;
    if (date > maxDate) return false;
    
    return true;
  };

  const canConfirm = useMemo(() => {
    if (!selectedDate) return false;
    if (!appointment?.isFullDay && !selectedTime) return false;
    
    // Verificar se a nova data/hora é diferente da atual
    if (appointment) {
      const sameDate = isSameDay(selectedDate, appointment.currentDate);
      const sameTime = selectedTime === appointment.currentTime;
      if (sameDate && (appointment.isFullDay || sameTime)) return false;
    }
    
    return true;
  }, [selectedDate, selectedTime, appointment]);

  const handleConfirm = async () => {
    if (!canConfirm || !appointment) return;
    
    setIsSubmitting(true);
    
    try {
      // Atualizar agendamento no banco
      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: selectedDate?.toISOString().split("T")[0],
          appointment_time: selectedTime && !appointment.isFullDay ? selectedTime : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.id);

      if (error) throw error;
      
      toast.success("Reagendamento confirmado!", {
        description: `Novo horário: ${format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })}${!appointment.isFullDay && selectedTime ? ` às ${selectedTime}` : ""}`,
      });
      
      navigate("/agenda");
    } catch (error) {
      console.error("Error rescheduling:", error);
      toast.error("Erro ao reagendar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen gradient-bg dark flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Agendamento não encontrado</h1>
        <p className="text-muted-foreground text-center mb-6">
          Não foi possível encontrar os dados do agendamento.
        </p>
        <Button onClick={() => navigate("/agenda")} variant="outline">
          Voltar à Agenda
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg dark flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border/50">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Reagendar</h1>
          <p className="text-sm text-muted-foreground">Escolha uma nova data</p>
        </div>
        <RefreshCw className="w-5 h-5 text-primary" />
      </header>

      <main className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* Current Appointment Info */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Agendamento atual</p>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{appointment.vehicleModel}</p>
              <p className="text-sm text-muted-foreground">{appointment.vehiclePlate}</p>
            </div>
          </div>
          
          <div className="h-px bg-border my-3" />
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">{appointment.service}</p>
              <p className="text-sm text-muted-foreground">
                {format(appointment.currentDate, "EEEE, dd/MM", { locale: ptBR })}
                {!appointment.isFullDay && appointment.currentTime && ` às ${appointment.currentTime}`}
              </p>
            </div>
          </div>
        </div>

        {/* New Date Selection */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-foreground">Selecione a nova data</h2>
          
          <div className="glass-card rounded-xl p-2 flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              disabled={(date) => !isDateAvailable(date)}
              className="pointer-events-auto mx-auto"
            />
          </div>

          {selectedDate && !appointment.isFullDay && (
            <>
              <h3 className="text-base font-medium text-foreground mt-6">Horários disponíveis</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {allTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "glass-card rounded-xl p-4 flex items-center justify-center gap-2 transition-all",
                      selectedTime === time && "ring-2 ring-primary bg-primary/20"
                    )}
                  >
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{time}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedDate && appointment.isFullDay && (
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm text-primary bg-primary/10 rounded-lg px-3 py-2">
                Serviço de dia inteiro. Traga o veículo pela manhã.
              </p>
            </div>
          )}
        </div>

        {/* Info Notice */}
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Reagendamento sem custos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Você pode reagendar quantas vezes precisar sem nenhuma taxa adicional.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pt-8">
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm || isSubmitting}
          className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Reagendando...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Confirmar Reagendamento
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Reagendamento;
