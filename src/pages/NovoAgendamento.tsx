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
  Zap,
  Plus,
  Stethoscope,
  Gift,
  Percent,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock de veículos cadastrados
const mockVehicles = [
  { id: "1", model: "VW Golf", plate: "ABC-1234", year: "2020" },
  { id: "2", model: "Fiat Argo", plate: "XYZ-5678", year: "2022" },
];

// Tipos de atendimento
const serviceTypes = [
  { id: "revisao", name: "Revisão", icon: Settings, description: "Manutenção preventiva completa" },
  { id: "diagnostico", name: "Diagnóstico", icon: Stethoscope, description: "Identificação de problemas" },
];

// Serviços disponíveis por tipo (fullDay = serviço que leva o dia todo)
const services = {
  revisao: [
    { id: "troca-oleo", name: "Troca de Óleo", icon: Droplets, duration: 30, price: 150, fullDay: false },
    { id: "filtros", name: "Troca de Filtros", icon: Settings, duration: 20, price: 80, fullDay: false },
    { id: "freios", name: "Revisão de Freios", icon: Car, duration: 60, price: 200, fullDay: false },
    { id: "suspensao", name: "Revisão de Suspensão", icon: Wrench, duration: 90, price: 350, fullDay: false },
    { id: "alinhamento", name: "Alinhamento e Balanceamento", icon: Car, duration: 45, price: 120, fullDay: false },
    { id: "revisao-completa", name: "Revisão Completa", icon: Settings, duration: 480, price: 800, fullDay: true },
  ],
  diagnostico: [
    { id: "eletrica", name: "Diagnóstico Elétrico", icon: Zap, duration: 60, price: 150, fullDay: false },
    { id: "motor", name: "Diagnóstico de Motor", icon: Settings, duration: 90, price: 200, fullDay: false },
    { id: "injecao", name: "Diagnóstico de Injeção", icon: Droplets, duration: 60, price: 180, fullDay: false },
    { id: "geral", name: "Check-up Geral", icon: Stethoscope, duration: 120, price: 250, fullDay: false },
    { id: "pericia", name: "Perícia Completa", icon: Stethoscope, duration: 480, price: 600, fullDay: true },
  ],
};

const morningSlots = ["08:00", "09:00", "10:00", "11:00"];
const afternoonSlots = ["14:00", "15:00", "16:00", "17:00"];
const allTimeSlots = [...morningSlots, ...afternoonSlots];
const fullDaySlot = ["08:00 (Dia inteiro)"];

const NovoAgendamento = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1: Vehicle
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  
  // Step 2: Service Type
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Step 3: Services (multiple)
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Step 4: Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Step 5: Payment option
  const [payInAdvance, setPayInAdvance] = useState(false);

  const availableServices = selectedType ? services[selectedType as keyof typeof services] : [];
  
  const selectedServiceDetails = availableServices.filter(s => selectedServices.includes(s.id));
  const totalDuration = selectedServiceDetails.reduce((acc, s) => acc + s.duration, 0);
  const subtotal = selectedServiceDetails.reduce((acc, s) => acc + s.price, 0);
  
  // Desconto progressivo
  const getDiscount = () => {
    const count = selectedServices.length;
    if (count >= 4) return { percent: 15, label: "15% OFF - Combo Master" };
    if (count >= 3) return { percent: 10, label: "10% OFF - Combo Plus" };
    if (count >= 2) return { percent: 5, label: "5% OFF - Combo" };
    return { percent: 0, label: "" };
  };
  
  const discount = getDiscount();
  const discountAmount = Math.round(subtotal * (discount.percent / 100));
  const priceAfterDiscount = subtotal - discountAmount;
  
  // Bônus por antecipação (5% extra)
  const advanceBonus = payInAdvance ? Math.round(priceAfterDiscount * 0.05) : 0;
  const finalPrice = priceAfterDiscount - advanceBonus;

  // Verifica se algum serviço é de dia inteiro
  const hasFullDayService = selectedServiceDetails.some(s => s.fullDay);
  
  // Horários disponíveis baseado na quantidade de serviços
  const getAvailableTimeSlots = () => {
    if (hasFullDayService) return fullDaySlot;
    if (selectedServices.length >= 3) return morningSlots; // 3+ serviços = só manhã
    return allTimeSlots;
  };
  
  const availableTimeSlots = getAvailableTimeSlots();

  const getVehicleDisplay = () => {
    if (isNewVehicle) {
      return { model: newVehicleModel, plate: newVehiclePlate };
    }
    return mockVehicles.find(v => v.id === selectedVehicle);
  };

  const canProceed = () => {
    if (step === 1) {
      if (isNewVehicle) return newVehicleModel.trim() !== "" && newVehiclePlate.trim() !== "";
      return !!selectedVehicle;
    }
    if (step === 2) return !!selectedType;
    if (step === 3) return selectedServices.length > 0;
    if (step === 4) return !!selectedDate && !!selectedTime;
    return false;
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/agenda");
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleConfirm = () => {
    toast.success("Agendamento solicitado!", {
      description: "A oficina receberá sua solicitação por email.",
    });
    navigate("/agenda");
  };

  const steps = [
    { num: 1, label: "Veículo" },
    { num: 2, label: "Tipo" },
    { num: 3, label: "Serviços" },
    { num: 4, label: "Data" },
    { num: 5, label: "Confirmar" },
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}min`;
  };

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
                <span className="text-[10px] text-muted-foreground mt-1">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-6 h-0.5 mx-1 transition-all",
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
        {/* Step 1: Vehicle Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Selecione o veículo</h2>
            
            {/* Registered Vehicles */}
            {mockVehicles.length > 0 && !isNewVehicle && (
              <div className="space-y-3">
                {mockVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => {
                      setSelectedVehicle(vehicle.id);
                      setIsNewVehicle(false);
                    }}
                    className={cn(
                      "w-full glass-card rounded-xl p-4 flex items-center gap-4 transition-all text-left",
                      selectedVehicle === vehicle.id && !isNewVehicle && "ring-2 ring-primary"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{vehicle.model}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.plate} • {vehicle.year}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {mockVehicles.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* Add New Vehicle */}
            {!isNewVehicle ? (
              <button
                onClick={() => {
                  setIsNewVehicle(true);
                  setSelectedVehicle(null);
                }}
                className="w-full glass-card rounded-xl p-4 flex items-center gap-4 border-2 border-dashed border-muted-foreground/30"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">Informar outro veículo</p>
              </button>
            ) : (
              <div className="glass-card rounded-xl p-4 space-y-4 ring-2 ring-primary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">Novo veículo</p>
                </div>
                <Input
                  placeholder="Modelo (ex: VW Golf)"
                  value={newVehicleModel}
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  placeholder="Placa (ex: ABC-1234)"
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                  className="bg-background/50"
                />
                <button
                  onClick={() => {
                    setIsNewVehicle(false);
                    setNewVehicleModel("");
                    setNewVehiclePlate("");
                  }}
                  className="text-sm text-muted-foreground underline"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Service Type */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Tipo de atendimento</h2>
            <div className="space-y-3">
              {serviceTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setSelectedServices([]); // Reset services when type changes
                    }}
                    className={cn(
                      "w-full glass-card rounded-xl p-4 flex items-center gap-4 transition-all text-left",
                      selectedType === type.id && "ring-2 ring-primary"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      selectedType === type.id ? "bg-primary/30" : "bg-primary/20"
                    )}>
                      <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Services (Multiple Selection) */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Selecione os serviços</h2>
              {selectedServices.length > 0 && (
                <span className="text-sm text-primary font-medium">
                  {selectedServices.length} selecionado{selectedServices.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {availableServices.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "w-full glass-card rounded-xl p-4 flex items-center gap-4 transition-all text-left",
                      isSelected && "ring-2 ring-primary"
                    )}
                  >
                    <Checkbox 
                      checked={isSelected}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary/30" : "bg-primary/10"
                    )}>
                      <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDuration(service.duration)}</p>
                    </div>
                    <span className="text-primary font-semibold">R$ {service.price}</span>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            {selectedServices.length > 0 && (
              <div className="glass-card rounded-xl p-4 mt-4 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duração estimada</span>
                  <span className="font-medium text-foreground">{formatDuration(totalDuration)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className={cn(
                    "font-medium",
                    discount.percent > 0 ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    R$ {subtotal}
                  </span>
                </div>

                {/* Discount Badge */}
                {discount.percent > 0 && (
                  <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">{discount.label}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">-R$ {discountAmount}</span>
                  </div>
                )}

                {/* Next discount hint */}
                {selectedServices.length === 1 && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2">
                    <Gift className="w-4 h-4" />
                    <span>Adicione mais 1 serviço e ganhe 5% OFF!</span>
                  </div>
                )}
                {selectedServices.length === 2 && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2">
                    <Gift className="w-4 h-4" />
                    <span>Mais 1 serviço = 10% OFF!</span>
                  </div>
                )}
                {selectedServices.length === 3 && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2">
                    <Gift className="w-4 h-4" />
                    <span>Mais 1 serviço = 15% OFF!</span>
                  </div>
                )}

                <div className="h-px bg-border" />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">R$ {priceAfterDiscount}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Date & Time */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Escolha data e horário</h2>
            
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

            {selectedDate && (
              <>
                <h3 className="text-base font-medium text-foreground mt-4">Horários disponíveis</h3>
                
                {selectedServices.length >= 3 && !hasFullDayService && (
                  <p className="text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2 mb-2">
                    Com 3+ serviços, apenas horários da manhã estão disponíveis.
                  </p>
                )}
                
                {hasFullDayService && (
                  <p className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2 mb-2">
                    Serviço de dia inteiro selecionado. Início às 08:00.
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "glass-card rounded-xl p-4 flex items-center justify-center gap-2 transition-all",
                        selectedTime === time && "ring-2 ring-primary bg-primary/20",
                        hasFullDayService && "col-span-2"
                      )}
                    >
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{time}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Confirme seu agendamento</h2>
            
            <div className="glass-card rounded-xl p-5 space-y-4">
              {/* Vehicle */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Veículo</p>
                  <p className="font-medium text-foreground">
                    {getVehicleDisplay()?.model} • {getVehicleDisplay()?.plate}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Services */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Serviços</p>
                <div className="space-y-2">
                  {selectedServiceDetails.map(service => (
                    <div key={service.id} className="flex items-center justify-between">
                      <span className="text-foreground">{service.name}</span>
                      <span className="text-muted-foreground text-sm">R$ {service.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data e horário</p>
                  <p className="font-medium text-foreground">
                    {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às {selectedTime}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Duration */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duração estimada</span>
                <span className="font-medium text-foreground">{formatDuration(totalDuration)}</span>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className={cn(
                    discount.percent > 0 ? "line-through text-muted-foreground" : "text-foreground font-medium"
                  )}>
                    R$ {subtotal}
                  </span>
                </div>

                {discount.percent > 0 && (
                  <div className="flex items-center justify-between text-sm bg-emerald-500/10 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-emerald-500">{discount.label}</span>
                    </div>
                    <span className="font-bold text-emerald-500">-R$ {discountAmount}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Advance Payment Bonus */}
              <button
                onClick={() => setPayInAdvance(!payInAdvance)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  payInAdvance ? "bg-amber-500/20 ring-2 ring-amber-500" : "bg-muted/50"
                )}
              >
                <Checkbox 
                  checked={payInAdvance}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-foreground">Pagar antecipado</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ganhe 5% extra de desconto</p>
                </div>
                {payInAdvance && (
                  <span className="text-sm font-bold text-amber-500">-R$ {advanceBonus}</span>
                )}
              </button>

              <div className="h-px bg-border" />
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-foreground font-medium">Total final</span>
                <div className="text-right">
                  {(discount.percent > 0 || payInAdvance) && (
                    <span className="text-xs text-emerald-500 block">
                      Economia de R$ {discountAmount + advanceBonus}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary">R$ {finalPrice}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              A oficina receberá sua solicitação por email e confirmará o agendamento.
            </p>
          </div>
        )}
      </main>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pt-8">
        {step < 5 ? (
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