import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench, Star, Gift, Sparkles, ChevronRight, MapPin, Users, Droplets, GraduationCap, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  date: Date;
  time: string | null;
  service: string;
  status: "confirmado" | "pendente" | "concluido";
  vehicleModel?: string;
  vehiclePlate?: string;
  isFullDay?: boolean;
}

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_label: string;
  discount_percent: number;
  valid_to: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  location: string | null;
}

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

const eventIcons: Record<string, React.ElementType> = {
  workshop: GraduationCap,
  meetup: Users,
  carwash: Droplets,
  training: GraduationCap,
  other: Star,
};

const Agenda = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          is_full_day,
          vehicles (model, plate, brand),
          appointment_services (
            services (name)
          )
        `)
        .eq("user_id", user.id)
        .gte("appointment_date", new Date().toISOString().split("T")[0])
        .in("status", ["pendente", "confirmado"])
        .order("appointment_date", { ascending: true });

      const formattedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        date: new Date(apt.appointment_date),
        time: apt.appointment_time?.slice(0, 5) || null,
        service: apt.appointment_services?.[0]?.services?.name || "Serviço",
        status: apt.status === "confirmado" ? "confirmado" : "pendente",
        vehicleModel: apt.vehicles ? `${apt.vehicles.brand || ''} ${apt.vehicles.model}`.trim() : undefined,
        vehiclePlate: apt.vehicles?.plate,
        isFullDay: apt.is_full_day,
      }));

      setAppointments(formattedAppointments);

      // Fetch active promotions
      const { data: promotionsData } = await supabase
        .from("promotions")
        .select("id, title, description, discount_label, discount_percent, valid_to")
        .eq("is_active", true)
        .gte("valid_to", new Date().toISOString().split("T")[0])
        .order("valid_to", { ascending: true });

      setPromotions(promotionsData || []);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from("events")
        .select("id, title, description, event_date, event_type, location")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true });

      setEvents(eventsData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlistClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("waitlist_interests").insert({
        user_id: user?.id || null,
        source: "agenda_promos",
      });
      toast.info("Interesse registrado!", {
        description: "Você será notificado quando tivermos promoções exclusivas para você.",
      });
    } catch (error) {
      console.error("Error registering waitlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen gradient-bg dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((apt) => {
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
                                  vehicleModel: apt.vehicleModel || "Veículo",
                                  vehiclePlate: apt.vehiclePlate || "",
                                  service: apt.service,
                                  currentDate: apt.date,
                                  currentTime: apt.time,
                                  isFullDay: apt.isFullDay || false,
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
                              {format(apt.date, "dd/MM", { locale: ptBR })} {apt.time ? `às ${apt.time}` : "(dia todo)"}
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

          {/* 3. PROMOÇÕES */}
          <AccordionItem value="promos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-primary/30 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-foreground">Promoções Prime</span>
                  {promotions.length > 0 && (
                    <span className="text-xs text-amber-500 font-medium">
                      {promotions.length} oferta{promotions.length > 1 ? "s" : ""} disponíve{promotions.length > 1 ? "is" : "l"}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {promotions.length > 0 ? (
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <button
                      key={promo.id}
                      onClick={() => {
                        toast.success("Oferta selecionada!", {
                          description: "Redirecionando para agendamento...",
                        });
                        navigate("/novo-agendamento", { state: { promotionId: promo.id } });
                      }}
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
                              {promo.discount_label}
                            </span>
                          </div>
                          {promo.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {promo.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              Válido até {format(new Date(promo.valid_to), "dd/MM", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
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

          {/* 4. EVENTOS */}
          <AccordionItem value="eventos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-foreground">Eventos Prime</span>
                  {events.length > 0 && (
                    <span className="text-xs text-purple-500 font-medium">
                      {events.length} evento{events.length > 1 ? "s" : ""} próximo{events.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => {
                    const EventIcon = eventIcons[event.event_type] || Star;
                    
                    return (
                      <button
                        key={event.id}
                        onClick={async () => {
                          try {
                            const { data: { user } } = await supabase.auth.getUser();
                            await supabase.from("event_clicks").insert({
                              event_id: event.id,
                              user_id: user?.id || null,
                            });
                          } catch (e) {}
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
                            <p className="font-medium text-foreground">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(event.event_date), "dd MMM", { locale: ptBR })}</span>
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
