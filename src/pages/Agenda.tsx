import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench, Star, Gift, Sparkles, ChevronRight, MapPin, Users, Droplets, GraduationCap } from "lucide-react";
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
import {
  userVehicles,
  getActivePromotions,
  getUpcomingEvents,
  eventTypeLabels,
  type PrimePromotion,
  type PrimeEvent,
} from "@/data/promotions";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  service: string;
  status: "confirmado" | "pendente" | "concluido";
}

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

const eventIcons: Record<PrimeEvent["type"], React.ElementType> = {
  workshop: GraduationCap,
  meetup: Users,
  carwash: Droplets,
  training: GraduationCap,
  other: Star,
};

const Agenda = () => {
  const navigate = useNavigate();
  const [clickedPromoIds, setClickedPromoIds] = useState<string[]>([]);
  const [clickedEventIds, setClickedEventIds] = useState<string[]>([]);
  
  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Usa os dados centralizados
  const userVehicleModels = userVehicles.map(v => v.model);
  const activePromotions = getActivePromotions(userVehicleModels);
  const upcomingEvents = getUpcomingEvents();

  const handlePromoClick = (promo: PrimePromotion) => {
    if (!clickedPromoIds.includes(promo.id)) {
      setClickedPromoIds(prev => [...prev, promo.id]);
      console.log(`[TRACKING] Promo clicked: ${promo.id} - ${promo.title}`);
    }
    
    toast.success("Oferta selecionada!", {
      description: "Redirecionando para agendamento...",
    });
    navigate("/novo-agendamento", { state: { promotion: promo } });
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
        <Accordion type="multiple" defaultValue={["agendamentos", "agendar", "promos", "eventos"]} className="space-y-3">
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
                  {upcomingAppointments.map((apt) => {
                    const canReschedule = apt.status === "confirmado";
                    
                    return (
                      <button
                        key={apt.id}
                        onClick={() => {
                          if (canReschedule) {
                            navigate("/reagendamento", {
                              state: {
                                appointment: {
                                  id: apt.id,
                                  vehicleModel: "Volkswagen Polo", // Mock - será do backend
                                  vehiclePlate: "ABC-1234", // Mock - será do backend
                                  service: apt.service,
                                  currentDate: apt.date,
                                  currentTime: apt.time,
                                  isFullDay: false,
                                },
                              },
                            });
                          }
                        }}
                        disabled={!canReschedule}
                        className={cn(
                          "w-full bg-background/50 rounded-xl p-4 flex items-center gap-4 text-left transition-all",
                          canReschedule && "hover:bg-background/70 hover:ring-1 hover:ring-primary/30 cursor-pointer",
                          !canReschedule && "opacity-60 cursor-not-allowed"
                        )}
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
                          {canReschedule && (
                            <p className="text-xs text-primary mt-1">Toque para reagendar</p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            statusColors[apt.status]
                          )}
                        >
                          {statusLabels[apt.status]}
                        </span>
                      </button>
                    );
                  })}
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
          <AccordionItem value="promos" className="glass-card rounded-xl border-none">
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
                        onClick={() => handlePromoClick(promo)}
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

          {/* 4. EVENTOS PRIME */}
          <AccordionItem value="eventos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-foreground">Eventos Prime</span>
                  {upcomingEvents.length > 0 && (
                    <span className="text-xs text-purple-500 font-medium">
                      {upcomingEvents.length} evento{upcomingEvents.length > 1 ? "s" : ""} próximo{upcomingEvents.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const EventIcon = eventIcons[event.type];
                    const typeInfo = eventTypeLabels[event.type];
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          if (!clickedEventIds.includes(event.id)) {
                            setClickedEventIds(prev => [...prev, event.id]);
                            console.log(`[TRACKING] Event clicked: ${event.id} - ${event.title}`);
                          }
                          toast.info("Evento selecionado!", {
                            description: "Detalhes do evento em breve.",
                          });
                        }}
                        className="w-full bg-background/50 rounded-xl p-4 border-l-4 border-purple-500 transition-all hover:bg-background/70 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <EventIcon className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground">{event.title}</p>
                              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", typeInfo.color)}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(event.date, "dd MMM", { locale: ptBR })}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{event.location}</span>
                                </div>
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
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">Nenhum evento programado</p>
                  <p className="text-xs text-muted-foreground mt-1">Fique atento às novidades!</p>
                </div>
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
