import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Wrench, 
  Calendar, 
  Clock,
  Car,
  Droplets,
  Settings,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const services = [
  { id: "troca-oleo", name: "Troca de Óleo", icon: Droplets, duration: "30 min", price: "R$ 150" },
  { id: "revisao", name: "Revisão Completa", icon: Settings, duration: "2h", price: "R$ 450" },
  { id: "freios", name: "Manutenção de Freios", icon: Car, duration: "1h", price: "R$ 280" },
  { id: "suspensao", name: "Suspensão", icon: Wrench, duration: "1h30", price: "R$ 350" },
  { id: "eletrica", name: "Elétrica", icon: Zap, duration: "1h", price: "R$ 200" },
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", 
  "14:00", "15:00", "16:00", "17:00"
];

const NovoAgendamento = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const selectedServiceData = services.find(s => s.id === selectedService);

  const canProceed = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate;
    if (step === 3) return !!selectedTime;
    return false;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/agenda");
    }
  };

  const handleConfirm = () => {
    toast.success("Agendamento solicitado com sucesso!", {
      description: "Você receberá uma confirmação em breve.",
    });
    navigate("/agenda");
  };

  const steps = [
    { num: 1, label: "Serviço" },
    { num: 2, label: "Data" },
    { num: 3, label: "Horário" },
    { num: 4, label: "Confirmar" },
  ];

  return (
    <div className="min-h-screen gradient-bg dark flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 pt-12">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Novo Agendamento</h1>
      </header>

      {/* Progress Steps */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    step >= s.num 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-12 h-0.5 mx-2 transition-all",
                    step > s.num ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 overflow-y-auto pb-32">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-foreground mb-4">Escolha o serviço</h2>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={cn(
                    "w-full glass-card rounded-xl p-4 flex items-center gap-4 transition-all text-left",
                    selectedService === service.id && "ring-2 ring-primary"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    selectedService === service.id ? "bg-primary/30" : "bg-primary/20"
                  )}>
                    <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.duration}</p>
                  </div>
                  <span className="text-primary font-semibold">{service.price}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">Escolha a data</h2>
            <div className="glass-card rounded-2xl p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="pointer-events-auto mx-auto"
              />
            </div>
          </div>
        )}

        {/* Step 3: Select Time */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">Escolha o horário</h2>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((time) => (
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
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">Confirme seu agendamento</h2>
            <div className="glass-card rounded-xl p-6 space-y-4">
              {selectedServiceData && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <selectedServiceData.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serviço</p>
                    <p className="font-medium text-foreground">{selectedServiceData.name}</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-border" />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">
                    {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">{selectedTime}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Valor estimado</span>
                <span className="text-xl font-bold text-primary">{selectedServiceData?.price}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pt-8">
        {step < 4 ? (
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg disabled:opacity-50"
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleConfirm}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmar Agendamento
          </Button>
        )}
      </div>
    </div>
  );
};

export default NovoAgendamento;