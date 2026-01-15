import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, isSameDay, startOfDay } from "date-fns";
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
  CreditCard,
  Phone,
  AlertCircle,
  Info,
  Wallet
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { type PrimePromotion } from "@/data/promotions";
import {
  trackFunnelEvent,
  generateSessionId,
  clearSession,
  type FlowType,
} from "@/utils/analytics";
import { supabase } from "@/integrations/supabase/client";

interface UserVehicle {
  id: string;
  model: string;
  plate: string;
  brand: string | null;
  year?: string;
}

// Tipos de atendimento
const serviceTypes = [
  { id: "revisao", name: "Revisão", icon: Settings, description: "Manutenção preventiva completa", fullDay: false },
  { id: "diagnostico", name: "Diagnóstico", icon: Stethoscope, description: "Requer 1 dia com o veículo", fullDay: true },
];

// Serviços disponíveis por tipo (fullDay = dia todo, price = 0 = sob consulta)
// laborCost = custo de mão de obra (onde o cashback pode ser aplicado)
const services = {
  revisao: [
    { id: "troca-oleo", name: "Troca de Óleo", icon: Droplets, duration: 30, price: 150, laborCost: 80, fullDay: false },
    { id: "filtros", name: "Troca de Filtros", icon: Settings, duration: 20, price: 80, laborCost: 40, fullDay: false },
    { id: "freios", name: "Revisão de Freios", icon: Car, duration: 60, price: 200, laborCost: 120, fullDay: false },
    { id: "suspensao", name: "Revisão de Suspensão", icon: Wrench, duration: 90, price: 0, laborCost: 0, fullDay: false },
    { id: "alinhamento", name: "Alinhamento e Balanceamento", icon: Car, duration: 45, price: 120, laborCost: 80, fullDay: false },
    { id: "revisao-completa", name: "Revisão Completa", icon: Settings, duration: 480, price: 0, laborCost: 0, fullDay: true },
  ],
  diagnostico: [
    { id: "eletrica", name: "Diagnóstico Elétrico", icon: Zap, duration: 480, price: 150, laborCost: 150, fullDay: true },
    { id: "motor", name: "Diagnóstico de Motor", icon: Settings, duration: 480, price: 0, laborCost: 0, fullDay: true },
    { id: "injecao", name: "Diagnóstico de Injeção", icon: Droplets, duration: 480, price: 180, laborCost: 180, fullDay: true },
    { id: "geral", name: "Check-up Geral", icon: Stethoscope, duration: 480, price: 250, laborCost: 250, fullDay: true },
    { id: "pericia", name: "Perícia Completa", icon: Stethoscope, duration: 480, price: 0, laborCost: 0, fullDay: true },
  ],
};

const morningSlots = ["08:00", "09:00", "10:00", "11:00"];
const afternoonSlots = ["14:00", "15:00", "16:00", "17:00"];
const allTimeSlots = [...morningSlots, ...afternoonSlots];
const fullDaySlot = ["08:00 (Dia inteiro)"];

interface LocationState {
  promotion?: PrimePromotion;
}

const NovoAgendamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  
  // Verifica se veio de uma promoção
  const promotion = locationState?.promotion;
  const isPromoFlow = !!promotion;
  
  // Para fluxo de promoção: pula direto para calendário (step 1 no fluxo reduzido)
  // Para fluxo normal: começa no veículo (step 1)
  const [step, setStep] = useState(isPromoFlow ? 1 : 1);
  
  // Vehicles from database
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
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
  
  // Cashback - buscar do perfil do usuário
  const [useCashback, setUseCashback] = useState(false);
  const [availableCashback, setAvailableCashback] = useState(0);

  // Fetch cashback from user profile
  useEffect(() => {
    const fetchCashback = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("loyalty_points")
          .eq("user_id", user.id)
          .single();

        if (profile?.loyalty_points) {
          setAvailableCashback(profile.loyalty_points);
        }
      } catch (error) {
        console.error("Error fetching cashback:", error);
      }
    };

    fetchCashback();
  }, []);

  // Fetch vehicles from database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingVehicles(false);
          return;
        }

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
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // Para fluxo de promoção: filtra veículos elegíveis
  const eligibleVehicles = useMemo(() => {
    if (!promotion) return vehicles;
    if (promotion.vehicleModels.length === 0) return vehicles;
    
    return vehicles.filter(v => 
      promotion.vehicleModels.some(model => 
        v.model.toLowerCase().includes(model.toLowerCase()) ||
        model.toLowerCase().includes(v.model.toLowerCase())
      )
    );
  }, [promotion, vehicles]);

  // Auto-seleciona veículo se só tem um elegível no fluxo de promoção
  useEffect(() => {
    if (isPromoFlow && eligibleVehicles.length === 1) {
      setSelectedVehicle(eligibleVehicles[0].id);
    }
  }, [isPromoFlow, eligibleVehicles]);

  // Tracking: inicia sessão ao entrar no fluxo
  useEffect(() => {
    const flowType: FlowType = isPromoFlow ? "promo" : "normal";
    const vehicleModel = isPromoFlow && eligibleVehicles.length === 1 
      ? eligibleVehicles[0].model 
      : undefined;
    
    generateSessionId();
    trackFunnelEvent({
      eventType: "flow_started",
      flowType,
      promoId: promotion?.id,
      promoTitle: promotion?.title,
      vehicleModel,
      stepNumber: 1,
      totalSteps: isPromoFlow ? 2 : 5,
    });

    // Cleanup: rastreia abandono quando sai da página
    return () => {
      // Não marca como abandonado se completou
    };
  }, []);

  // Datas disponíveis para promoção
  const availablePromoDates = promotion?.availableDates || [];
  
  const isDateAvailable = (date: Date) => {
    if (!isPromoFlow) return true;
    if (availablePromoDates.length === 0) return true;
    return availablePromoDates.some(d => isSameDay(d, date));
  };

  // Define steps baseado no fluxo
  const promoSteps = [
    { num: 1, label: "Data" },
    { num: 2, label: "Confirmar" },
  ];
  
  const normalSteps = [
    { num: 1, label: "Veículo" },
    { num: 2, label: "Tipo" },
    { num: 3, label: "Serviços" },
    { num: 4, label: "Data" },
    { num: 5, label: "Confirmar" },
  ];
  
  const steps = isPromoFlow ? promoSteps : normalSteps;
  const maxSteps = steps.length;

  const availableServices = selectedType ? services[selectedType as keyof typeof services] : [];
  
  // Para promoção: usa o serviço da promoção
  const promoService = useMemo(() => {
    if (!promotion?.serviceId) return null;
    for (const type in services) {
      const found = services[type as keyof typeof services].find(s => s.id === promotion.serviceId);
      if (found) return found;
    }
    return null;
  }, [promotion]);
  
  const selectedServiceDetails = isPromoFlow && promoService 
    ? [promoService] 
    : availableServices.filter(s => selectedServices.includes(s.id));
  const totalDuration = selectedServiceDetails.reduce((acc, s) => acc + s.duration, 0);
  const subtotal = selectedServiceDetails.reduce((acc, s) => acc + s.price, 0);
  const totalLaborCost = selectedServiceDetails.reduce((acc, s) => acc + (s.laborCost || 0), 0);
  
  // Desconto da promoção ou progressivo
  const getDiscount = () => {
    if (isPromoFlow && promotion) {
      return { percent: promotion.discountPercent, label: promotion.discount };
    }
    const count = selectedServices.length;
    if (count >= 4) return { percent: 15, label: "15% OFF - Combo Master" };
    if (count >= 3) return { percent: 10, label: "10% OFF - Combo Plus" };
    if (count >= 2) return { percent: 5, label: "5% OFF - Combo" };
    return { percent: 0, label: "" };
  };
  
  const discount = getDiscount();
  const discountAmount = Math.round(subtotal * (discount.percent / 100));
  const priceAfterDiscount = subtotal - discountAmount;
  
  // Cashback: só pode ser usado se NÃO tiver promoção e aplica só na mão de obra
  const hasPromotion = discount.percent > 0;
  const canUseCashback = !hasPromotion && !isPromoFlow && totalLaborCost > 0 && availableCashback > 0;
  const cashbackToApply = useCashback && canUseCashback 
    ? Math.min(availableCashback, totalLaborCost) 
    : 0;
  
  const hasVariablePrice = selectedServiceDetails.some(s => s.price === 0);
  const advanceBonus = (payInAdvance && !hasVariablePrice) ? Math.round((priceAfterDiscount - cashbackToApply) * 0.05) : 0;
  const finalPrice = priceAfterDiscount - cashbackToApply - advanceBonus;
  
  const variablePriceServices = selectedServiceDetails.filter(s => s.price === 0);

  const isDiagnostico = selectedType === "diagnostico";
  const hasFullDayService = selectedServiceDetails.some(s => s.fullDay) || isDiagnostico || (promoService?.fullDay);
  
  const getAvailableTimeSlots = () => {
    if (isDiagnostico || hasFullDayService) return fullDaySlot;
    if (selectedServices.length >= 3) return morningSlots;
    return allTimeSlots;
  };
  
  const availableTimeSlots = getAvailableTimeSlots();

  const getVehicleDisplay = () => {
    if (isNewVehicle) {
      return { model: newVehicleModel, plate: newVehiclePlate };
    }
    const vehicleList = isPromoFlow ? eligibleVehicles : vehicles;
    return vehicleList.find(v => v.id === selectedVehicle);
  };

  const canProceed = () => {
    if (isPromoFlow) {
      if (step === 1) return !!selectedDate;
      return false;
    }
    
    if (step === 1) {
      if (isNewVehicle) return newVehicleModel.trim() !== "" && newVehiclePlate.trim() !== "";
      return !!selectedVehicle;
    }
    if (step === 2) return !!selectedType;
    if (step === 3) return selectedServices.length > 0;
    if (step === 4) {
      if (isDiagnostico || hasFullDayService) return !!selectedDate;
      return !!selectedDate && !!selectedTime;
    }
    return false;
  };

  const handleNext = () => {
    const flowType: FlowType = isPromoFlow ? "promo" : "normal";
    const vehicleDisplay = getVehicleDisplay();
    
    // Track step completion
    const stepLabels = isPromoFlow 
      ? ["date_selected"] 
      : ["vehicle_selected", "type_selected", "services_selected", "date_selected"];
    
    if (step <= stepLabels.length) {
      trackFunnelEvent({
        eventType: stepLabels[step - 1] as any,
        flowType,
        promoId: promotion?.id,
        promoTitle: promotion?.title,
        vehicleModel: vehicleDisplay?.model,
        stepNumber: step,
        totalSteps: maxSteps,
      });
    }
    
    if (step < maxSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Abandonou no primeiro step
      const flowType: FlowType = isPromoFlow ? "promo" : "normal";
      trackFunnelEvent({
        eventType: "flow_abandoned",
        flowType,
        promoId: promotion?.id,
        promoTitle: promotion?.title,
        stepNumber: step,
        totalSteps: maxSteps,
      });
      clearSession();
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

  const handleConfirm = async () => {
    const vehicleDisplay = getVehicleDisplay();
    const dateStr = selectedDate ? format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR }) : "";
    const flowType: FlowType = isPromoFlow ? "promo" : "normal";
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para agendar.");
        return;
      }

      // Get vehicle ID - if new vehicle, create it first
      let vehicleId = selectedVehicle;
      
      if (isNewVehicle && newVehicleModel && newVehiclePlate) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            user_id: user.id,
            model: newVehicleModel.trim(),
            plate: newVehiclePlate.trim().toUpperCase(),
          })
          .select()
          .single();
        
        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          appointment_date: selectedDate?.toISOString().split("T")[0],
          appointment_time: selectedTime && !selectedTime.includes("Dia inteiro") ? selectedTime : null,
          is_full_day: hasFullDayService || isDiagnostico,
          status: "pendente",
          subtotal: subtotal,
          discount_amount: discountAmount,
          final_price: finalPrice,
          pay_in_advance: payInAdvance,
          promotion_id: promotion?.id || null,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Add services to appointment
      const servicesToAdd = selectedServiceDetails.map(service => ({
        appointment_id: appointment.id,
        service_id: service.id,
        price_at_booking: service.price,
      }));

      // Note: service_id expects UUID but we have string IDs from mock services
      // For now, skip this step - would need real service IDs from database

      // Track completion
      trackFunnelEvent({
        eventType: "flow_completed",
        flowType,
        promoId: promotion?.id,
        promoTitle: promotion?.title,
        vehicleModel: vehicleDisplay?.model,
        stepNumber: maxSteps,
        totalSteps: maxSteps,
      });
      clearSession();
      
      toast.success("Agendamento realizado com sucesso!");
      
      navigate("/agendamento-sucesso", {
        state: {
          promoTitle: promotion?.title,
          vehicleModel: vehicleDisplay?.model,
          date: dateStr,
        }
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao criar agendamento. Tente novamente.");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}min`;
  };

  // =============== RENDER ===============

  // Fluxo de Promoção
  if (isPromoFlow) {
    const promoVehicle = eligibleVehicles[0];
    
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
          <h1 className="text-xl font-semibold text-foreground">Agendar Promoção</h1>
        </header>

        {/* Promo Banner */}
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-amber-500/20 via-primary/20 to-amber-500/20 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{promotion.title}</p>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    {promotion.discount}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{promotion.serviceName}</p>
              </div>
            </div>
            {promoVehicle && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-500/20">
                <Car className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">
                  {promoVehicle.model} • {promoVehicle.plate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-center gap-2">
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
          {/* Step 1: Calendário */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Escolha uma data disponível</h2>
              
              <div className="glass-card rounded-2xl p-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  disabled={(date) => {
                    const today = startOfDay(new Date());
                    if (date < today) return true;
                    if (date.getDay() === 0) return true; // Domingo
                    return !isDateAvailable(date);
                  }}
                  modifiers={{
                    available: availablePromoDates,
                  }}
                  modifiersStyles={{
                    available: { 
                      backgroundColor: 'hsl(var(--primary) / 0.2)',
                      fontWeight: 'bold'
                    }
                  }}
                  className="pointer-events-auto mx-auto"
                />
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/30" />
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span>Indisponível</span>
                </div>
              </div>

              {/* Aviso sobre dia inteiro */}
              {selectedDate && promoService?.fullDay && (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-sm text-primary bg-primary/10 rounded-lg px-3 py-2">
                    Serviço de dia inteiro. Traga o veículo pela manhã.
                  </p>
                </div>
              )}

              {/* Lembrete sobre outros serviços */}
              <div className="bg-muted/50 rounded-xl p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Quer adicionar outros serviços?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Finalize este agendamento promocional primeiro. Após confirmar, você poderá agendar serviços adicionais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirmação */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Confirme seu agendamento</h2>
              
              <div className="glass-card rounded-xl p-5 space-y-4">
                {/* Promo Badge */}
                <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">{promotion.title}</span>
                  <span className="ml-auto text-sm font-bold text-amber-500">{promotion.discount}</span>
                </div>

                {/* Vehicle */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium text-foreground">
                      {promoVehicle?.model} • {promoVehicle?.plate}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Service */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Serviço</p>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{promotion.serviceName}</span>
                    {promoService && promoService.price > 0 ? (
                      <div className="text-right">
                        <span className="text-muted-foreground text-sm line-through mr-2">R$ {promoService.price}</span>
                        <span className="text-primary font-semibold">R$ {finalPrice}</span>
                      </div>
                    ) : (
                      <span className="text-amber-500 font-medium">{promotion.discount}</span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Date */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium text-foreground">
                      {selectedDate && format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {promoService?.fullDay && (
                      <p className="text-xs text-muted-foreground">Dia inteiro</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-foreground font-medium">Total final</span>
                  <div className="text-right">
                    {promoService && promoService.price > 0 && (
                      <span className="text-xs text-emerald-500 block">
                        Economia de R$ {discountAmount}
                      </span>
                    )}
                    {promoService && promoService.price > 0 ? (
                      <span className="text-2xl font-bold text-primary">R$ {finalPrice}</span>
                    ) : (
                      <span className="text-2xl font-bold text-emerald-500">GRÁTIS</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                A oficina receberá sua solicitação e confirmará o agendamento.
              </p>
            </div>
          )}
        </main>

        {/* Footer Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pt-8">
          {step < maxSteps ? (
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
  }

  // =============== FLUXO NORMAL ===============
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
            
            {/* Veículos cadastrados */}
            {vehicles.length > 0 && (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
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

            {/* Veículo novo adicionado via dialog */}
            {isNewVehicle && newVehicleModel && newVehiclePlate && (
              <div className="glass-card rounded-xl p-4 flex items-center gap-4 ring-2 ring-primary">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{newVehicleModel}</p>
                  <p className="text-sm text-muted-foreground">{newVehiclePlate}</p>
                </div>
                <button
                  onClick={() => {
                    setIsNewVehicle(false);
                    setNewVehicleModel("");
                    setNewVehiclePlate("");
                    setSelectedVehicle(null);
                  }}
                  className="text-xs text-muted-foreground underline"
                >
                  Remover
                </button>
              </div>
            )}

            {/* Separador */}
            {(vehicles.length > 0 || (isNewVehicle && newVehicleModel)) && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* Botão de adicionar novo veículo */}
            {!isNewVehicle && (
              <button 
                onClick={() => setIsNewVehicle(true)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center gap-3 text-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Adicionar Veículo</span>
              </button>
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
                      setSelectedServices([]);
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

        {/* Step 3: Services */}
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
                    {service.price > 0 ? (
                      <span className="text-primary font-semibold">R$ {service.price}</span>
                    ) : (
                      <span className="text-amber-500 font-medium text-sm">Sob consulta</span>
                    )}
                  </button>
                );
              })}
            </div>

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

                {discount.percent > 0 && (
                  <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">{discount.label}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">-R$ {discountAmount}</span>
                  </div>
                )}

                {selectedServices.length === 1 && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2">
                    <Gift className="w-4 h-4" />
                    <span>Adicione mais 1 serviço e ganhe 5% OFF!</span>
                  </div>
                )}

                {hasVariablePrice && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2">
                    <Phone className="w-4 h-4" />
                    <span>Serviço(s) com preço variável. A oficina entrará em contato.</span>
                  </div>
                )}

                <div className="h-px bg-border" />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <div className="text-right">
                    {hasVariablePrice ? (
                      <span className="text-lg font-bold text-foreground">
                        R$ {priceAfterDiscount} <span className="text-sm text-amber-500">+ sob consulta</span>
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-primary">R$ {priceAfterDiscount}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Date & Time */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">
              {isDiagnostico || hasFullDayService ? "Escolha o dia" : "Escolha data e horário"}
            </h2>
            
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

            {selectedDate && (isDiagnostico || hasFullDayService) && (
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-primary bg-primary/10 rounded-lg px-3 py-2">
                  {isDiagnostico 
                    ? "Diagnóstico requer pelo menos 1 dia com o veículo. Traga quando puder no dia selecionado."
                    : "Serviço de dia inteiro. Traga o veículo pela manhã."
                  }
                </p>
              </div>
            )}

            {selectedDate && !isDiagnostico && !hasFullDayService && (
              <>
                <h3 className="text-base font-medium text-foreground mt-4">Horários disponíveis</h3>
                
                {selectedServices.length >= 3 && (
                  <p className="text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2 mb-2">
                    Com 3+ serviços, apenas horários da manhã estão disponíveis.
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {availableTimeSlots.map((time) => (
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
                      {service.price > 0 ? (
                        <span className="text-muted-foreground text-sm">R$ {service.price}</span>
                      ) : (
                        <span className="text-amber-500 text-sm font-medium">Sob consulta</span>
                      )}
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
                  <p className="text-sm text-muted-foreground">
                    {isDiagnostico || hasFullDayService ? "Data" : "Data e horário"}
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedDate && format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                    {!isDiagnostico && !hasFullDayService && selectedTime && ` às ${selectedTime}`}
                  </p>
                  {(isDiagnostico || hasFullDayService) && (
                    <p className="text-xs text-muted-foreground">Dia inteiro</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Duration */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duração estimada</span>
                <span className="font-medium text-foreground">
                  {isDiagnostico || hasFullDayService ? "Dia inteiro" : formatDuration(totalDuration)}
                </span>
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

              {/* Cashback Option */}
              {canUseCashback && (
                <div className="space-y-3">
                  <button
                    onClick={() => setUseCashback(!useCashback)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                      useCashback ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50"
                    )}
                  >
                    <Checkbox 
                      checked={useCashback}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">Usar meu cashback</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Saldo: R$ {availableCashback.toFixed(2).replace('.', ',')} • Aplicável na mão de obra
                      </p>
                    </div>
                    {useCashback && (
                      <span className="text-sm font-bold text-primary">-R$ {cashbackToApply.toFixed(2).replace('.', ',')}</span>
                    )}
                  </button>
                  
                  {useCashback && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-primary">
                        <span className="font-medium">Cashback aplicado!</span> Desconto de R$ {cashbackToApply.toFixed(2).replace('.', ',')} na mão de obra (máx: R$ {totalLaborCost}).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info: Cashback não pode ser usado com promoções */}
              {hasPromotion && availableCashback > 0 && !isPromoFlow && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-muted">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Você tem R$ {availableCashback.toFixed(2).replace('.', ',')} de cashback, mas ele não pode ser combinado com promoções.
                  </p>
                </div>
              )}

              {canUseCashback && <div className="h-px bg-border" />}

              {/* Advance Payment Bonus */}
              {!hasVariablePrice ? (
                <div className="space-y-3">
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
                  
                  {payInAdvance && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Calendar className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="font-medium">Reagendamento garantido:</span> Precisou remarcar? Sem problema! 
                        Reagende pelo app ou entre em contato conosco.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10">
                  <Phone className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-500">Serviço(s) sob consulta</p>
                    <p className="text-xs text-muted-foreground">
                      A oficina entrará em contato para informar o valor.
                    </p>
                  </div>
                </div>
              )}

              <div className="h-px bg-border" />
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-foreground font-medium">Total final</span>
                <div className="text-right">
                  {(discount.percent > 0 || payInAdvance || useCashback) && !hasVariablePrice && (
                    <span className="text-xs text-emerald-500 block">
                      Economia de R$ {(discountAmount + advanceBonus + cashbackToApply).toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  {hasVariablePrice ? (
                    <span className="text-xl font-bold text-foreground">
                      R$ {finalPrice.toFixed(2).replace('.', ',')} <span className="text-sm text-amber-500">+ consulta</span>
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-primary">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {hasVariablePrice 
                ? "A oficina entrará em contato para confirmar valores e o agendamento."
                : "A oficina receberá sua solicitação por email e confirmará o agendamento."
              }
            </p>
          </div>
        )}
      </main>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pt-8">
        {step < maxSteps ? (
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
