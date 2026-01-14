import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench, Star, Gift, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  service: string;
  status: "confirmado" | "pendente" | "concluido";
}

interface PrimePromotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  validFrom: Date;
  validTo: Date;
  vehicleModels: string[]; // Modelos elegíveis (ex: "VW Golf", "Fiat Argo")
  image?: string;
}

// Mock de veículos do usuário
const userVehicles = [
  { id: "1", model: "VW Golf", plate: "ABC-1234" },
  { id: "2", model: "Fiat Argo", plate: "XYZ-5678" },
];

// Mock data - será substituído por dados do backend
const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: new Date(2026, 0, 16),
    time: "09:00",
    service: "Troca de óleo",
    status: "confirmado",
  },
  {
    id: "2",
    date: new Date(2026, 0, 20),
    time: "14:00",
    service: "Revisão completa",
    status: "pendente",
  },
];

// Promoções Prime exclusivas por modelo
const mockPromotions: PrimePromotion[] = [
  {
    id: "1",
    title: "Troca de Óleo VW",
    description: "Troca de óleo sintético com 30% OFF para veículos VW",
    discount: "30% OFF",
    validFrom: new Date(2026, 0, 1),
    validTo: new Date(2026, 1, 28),
    vehicleModels: ["VW Golf", "VW Polo", "VW T-Cross", "VW Virtus"],
  },
  {
    id: "2",
    title: "Revisão Fiat Argo",
    description: "Revisão completa com preço especial exclusivo",
    discount: "25% OFF",
    validFrom: new Date(2026, 0, 15),
    validTo: new Date(2026, 2, 15),
    vehicleModels: ["Fiat Argo", "Fiat Cronos", "Fiat Mobi"],
  },
  {
    id: "3",
    title: "Check-up Grátis Premium",
    description: "Diagnóstico completo gratuito para todos os modelos",
    discount: "GRÁTIS",
    validFrom: new Date(2026, 1, 1),
    validTo: new Date(2026, 1, 15),
    vehicleModels: [], // Vazio = todos os modelos
  },
];

const statusColors = {
  confirmado: "bg-emerald-500/20 text-emerald-500",
  pendente: "bg-amber-500/20 text-amber-500",
  concluido: "bg-muted text-muted-foreground",
};

const statusLabels = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  concluido: "Concluído",
};

const Agenda = () => {
  const navigate = useNavigate();
  const [clickedPromoIds, setClickedPromoIds] = useState<string[]>([]);
  
  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filtra promoções ativas e relevantes para os veículos do usuário
  const now = new Date();
  const userVehicleModels = userVehicles.map(v => v.model);
  
  const activePromotions = mockPromotions.filter(promo => {
    // Verifica se está no período válido
    const isActive = isWithinInterval(now, { start: promo.validFrom, end: promo.validTo });
    if (!isActive) return false;
    
    // Se não tem modelos específicos, vale para todos
    if (promo.vehicleModels.length === 0) return true;
    
    // Verifica se algum veículo do usuário é elegível
    return promo.vehicleModels.some(model => 
      userVehicleModels.some(userModel => 
        userModel.toLowerCase().includes(model.toLowerCase()) ||
        model.toLowerCase().includes(userModel.toLowerCase())
      )
    );
  });

  const handlePromoClick = (promoId: string, promoTitle: string) => {
    // Registra o clique (será enviado ao backend depois)
    if (!clickedPromoIds.includes(promoId)) {
      setClickedPromoIds(prev => [...prev, promoId]);
      console.log(`[TRACKING] Promo clicked: ${promoId} - ${promoTitle}`);
      // TODO: Enviar para o backend quando tivermos a API
    }
    
    toast.success("Oferta selecionada!", {
      description: "Vamos aplicar o desconto no agendamento.",
    });
    navigate("/novo-agendamento");
  };

  const handleWaitlistClick = () => {
    console.log("[TRACKING] Waitlist interest clicked");
    toast.info("Interesse registrado!", {
      description: "Você será notificado quando tivermos promoções exclusivas para você.",
    });
    // TODO: Registrar interesse no backend
  };

  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-4 overflow-y-auto pb-24">
        <Accordion type="multiple" defaultValue={["agendamentos", "agendar", "eventos"]} className="space-y-3">
          {/* 1. SEUS AGENDAMENTOS */}
          <AccordionItem value="agendamentos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-semibold text-foreground">Seus Agendamentos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-background/50 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{apt.service}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(apt.date, "dd/MM", { locale: ptBR })} às {apt.time}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          statusColors[apt.status]
                        )}
                      >
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">Nenhum agendamento</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 2. AGENDAR */}
          <AccordionItem value="agendar" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-base font-semibold text-foreground">Agendar</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Button 
                onClick={() => navigate("/novo-agendamento")}
                className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Solicitar Agendamento
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* 3. PROMOÇÕES PRIME EXCLUSIVAS */}
          <AccordionItem value="eventos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-primary/30 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-foreground">Promoções Prime</span>
                  {activePromotions.length > 0 && (
                    <span className="text-xs text-amber-500 font-medium">
                      {activePromotions.length} oferta{activePromotions.length > 1 ? "s" : ""} exclusiva{activePromotions.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {activePromotions.length > 0 ? (
                <div className="space-y-3">
                  {activePromotions.map((promo) => {
                    const eligibleVehicle = userVehicles.find(v => 
                      promo.vehicleModels.length === 0 ||
                      promo.vehicleModels.some(model => 
                        v.model.toLowerCase().includes(model.split(" ").pop()?.toLowerCase() || "")
                      )
                    );
                    
                    return (
                      <button
                        key={promo.id}
                        onClick={() => handlePromoClick(promo.id, promo.title)}
                        className="w-full bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 rounded-xl p-4 border border-amber-500/20 transition-all hover:border-amber-500/40 hover:scale-[1.01] active:scale-[0.99] text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                            <Gift className="w-6 h-6 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{promo.title}</p>
                              <span className="text-xs font-bold text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-full">
                                {promo.discount}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {promo.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                Válido até {format(promo.validTo, "dd/MM", { locale: ptBR })}
                              </span>
                              {eligibleVehicle && (
                                <span className="text-xs text-primary font-medium">
                                  Para seu {eligibleVehicle.model}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Estado vazio - Aguarde surpresa
                <button 
                  onClick={handleWaitlistClick}
                  className="w-full text-center py-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-dashed border-muted-foreground/30 hover:border-primary/40 transition-all"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Aguarde...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Logo você terá uma surpresa exclusiva! 🎁
                      </p>
                    </div>
                    <span className="text-xs text-primary font-medium mt-2">
                      Toque para registrar interesse
                    </span>
                  </div>
                </button>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Agenda;
