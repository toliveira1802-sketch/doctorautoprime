import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench, Gift, Sparkles, ChevronRight, Loader2, CalendarClock, XCircle, PartyPopper, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
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
  vehicle_models: string[] | null;
}

interface UserVehicle {
  id: string;
  model: string;
  brand: string | null;
}

interface PrimeEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: "workshop" | "meetup" | "carwash" | "training" | "other";
  event_date: string;
  event_time: string | null;
  location: string | null;
  max_participants: number | null;
}

const eventTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  workshop: { label: "Workshop", color: "bg-blue-500/20 text-blue-500", icon: "🔧" },
  meetup: { label: "Encontro", color: "bg-purple-500/20 text-purple-500", icon: "🤝" },
  carwash: { label: "Car Wash", color: "bg-cyan-500/20 text-cyan-500", icon: "🚿" },
  training: { label: "Treinamento", color: "bg-amber-500/20 text-amber-500", icon: "📚" },
  other: { label: "Evento", color: "bg-muted text-muted-foreground", icon: "🎉" },
};

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<PrimeEvent[]>([]);
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user vehicles
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("id, model, brand")
        .eq("user_id", user.id)
        .eq("is_active", true);

      setUserVehicles(vehiclesData || []);

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
        .select("id, title, description, discount_label, discount_percent, valid_to, vehicle_models")
        .eq("is_active", true)
        .gte("valid_to", new Date().toISOString().split("T")[0])
        .order("valid_to", { ascending: true });

      // Filter promotions that match user's vehicle models
      const userModels = (vehiclesData || []).map(v => v.model.toLowerCase());
      const matchedPromos = (promotionsData || []).filter(promo => {
        if (!promo.vehicle_models || promo.vehicle_models.length === 0) {
          return true; // Universal promotion
        }
        return promo.vehicle_models.some(model =>
          userModels.some(userModel => 
            userModel.includes(model.toLowerCase()) || 
            model.toLowerCase().includes(userModel)
          )
        );
      });

      setPromotions(matchedPromos);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from("events")
        .select("id, title, description, event_type, event_date, event_time, location, max_participants")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(5);

      setEvents((eventsData || []) as PrimeEvent[]);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoClick = async (promo: Promotion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("promo_clicks").insert({
          promotion_id: promo.id,
          user_id: user.id,
          source: "agenda"
        });
      }
    } catch (e) {}
    
    toast.success("Oferta selecionada!", {
      description: "Redirecionando para agendamento...",
    });
    navigate("/novo-agendamento", { 
      state: { 
        promotion: {
          id: promo.id,
          title: promo.title,
          description: promo.description,
          discount: promo.discount_label,
          vehicleModels: promo.vehicle_models || [],
          validTo: new Date(promo.valid_to)
        } 
      } 
    });
  };

  const handleEventClick = async (event: PrimeEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("event_clicks").insert({
          event_id: event.id,
          user_id: user.id,
        });
      }
    } catch (e) {}
    
    toast.success("Interesse registrado!", {
      description: `Você será avisado sobre "${event.title}"`,
    });
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsCancelling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", user?.id)
        .single();

      // Update appointment status to cancelled
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "cancelado",
          notes: cancelReason ? `Motivo do cancelamento: ${cancelReason}` : null
        })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      // Create recovery lead for management (diretoria) to follow up
      await supabase.from("recovery_leads").insert({
        user_id: user?.id,
        client_name: profile?.full_name || "Não identificado",
        phone: profile?.phone || "",
        vehicle_info: `${selectedAppointment.vehicleModel || "N/A"} - ${selectedAppointment.vehiclePlate || "N/A"}`,
        original_service: selectedAppointment.service,
        original_date: selectedAppointment.date.toISOString().split("T")[0],
        cancellation_reason: cancelReason || "Não informado",
        appointment_id: selectedAppointment.id,
        recovery_status: "pending",
      });

      toast.success("Agendamento cancelado", {
        description: "A diretoria foi notificada sobre o cancelamento.",
      });

      // Remove from local state
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Erro ao cancelar", {
        description: "Tente novamente ou entre em contato conosco.",
      });
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      setCancelReason("");
    }
  };

  const openCancelDialog = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(apt);
    setCancelDialogOpen(true);
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
        <Accordion type="multiple" defaultValue={[]} className="space-y-3">
          {/* 1. SEUS AGENDAMENTOS */}
          <AccordionItem value="agendamentos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-foreground">Seus Agendamentos</span>
                  {appointments.length > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {appointments.length} agendamento{appointments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const canModify = apt.status === "confirmado" || apt.status === "pendente";
                    
                    return (
                      <div
                        key={apt.id}
                        className="w-full bg-background/50 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-4">
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
                            {apt.vehicleModel && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {apt.vehicleModel} {apt.vehiclePlate && `• ${apt.vehiclePlate}`}
                              </p>
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
                        </div>
                        
                        {/* Action buttons */}
                        {canModify && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-primary border-primary/30 hover:bg-primary/10"
                              onClick={() => {
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
                              }}
                            >
                              <CalendarClock className="w-4 h-4 mr-1" />
                              Reagendar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={(e) => openCancelDialog(apt, e)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
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
                      {promotions.length} oferta{promotions.length > 1 ? "s" : ""} para você
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {promotions.length > 0 ? (
                <div className="space-y-3">
                  {promotions.map((promo) => {
                    const eligibleVehicle = userVehicles.find(v => {
                      if (!promo.vehicle_models || promo.vehicle_models.length === 0) return true;
                      return promo.vehicle_models.some(model =>
                        v.model.toLowerCase().includes(model.toLowerCase())
                      );
                    });

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
                              {eligibleVehicle && (
                                <span className="text-xs text-primary font-medium">
                                  Para seu {eligibleVehicle.brand || ''} {eligibleVehicle.model}
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
                  <PartyPopper className="w-5 h-5 text-purple-500" />
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
                    const config = eventTypeConfig[event.event_type] || eventTypeConfig.other;
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 rounded-xl p-4 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:scale-[1.01] active:scale-[0.99] text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 flex items-center justify-center flex-shrink-0 text-2xl">
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
                                {config.label}
                              </span>
                            </div>
                            <p className="font-semibold text-foreground mt-1 line-clamp-1">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{format(new Date(event.event_date), "dd/MM", { locale: ptBR })}</span>
                                {event.event_time && (
                                  <span className="text-purple-400 ml-1">
                                    {event.event_time.slice(0, 5)}
                                  </span>
                                )}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-[120px]">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-purple-500/50 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-primary/20 flex items-center justify-center">
                      <PartyPopper className="w-8 h-8 text-purple-500/60" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Em breve...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estamos preparando eventos exclusivos! 🎉
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <BottomNavigation />

      {/* Cancel Appointment Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? A diretoria será notificada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedAppointment && (
            <div className="bg-muted/50 rounded-lg p-3 my-2">
              <p className="font-medium">{selectedAppointment.service}</p>
              <p className="text-sm text-muted-foreground">
                {format(selectedAppointment.date, "dd/MM/yyyy", { locale: ptBR })} 
                {selectedAppointment.time && ` às ${selectedAppointment.time}`}
              </p>
              {selectedAppointment.vehicleModel && (
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.vehicleModel}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Motivo do cancelamento (opcional)
            </label>
            <Textarea
              placeholder="Ex: Imprevisto, mudança de planos..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelamento"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Agenda;
