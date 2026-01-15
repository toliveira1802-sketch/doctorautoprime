import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Gift, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_label: string;
  discount_percent: number;
  valid_to: string;
  vehicle_models: string[] | null;
}

interface Alert {
  id: string;
  title: string;
  alert_type: string;
  status: string;
}

interface UserVehicle {
  id: string;
  model: string;
  brand: string | null;
}

export function ActionButtons() {
  const navigate = useNavigate();
  const [showPromos, setShowPromos] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [pendingAlerts, setPendingAlerts] = useState<Alert[]>([]);
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user vehicles
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id, model, brand")
        .eq("user_id", user.id)
        .eq("is_active", true);

      setUserVehicles(vehicles || []);

      // Fetch active promotions
      const { data: promos } = await supabase
        .from("promotions")
        .select("id, title, description, discount_label, discount_percent, valid_to, vehicle_models")
        .eq("is_active", true)
        .gte("valid_to", new Date().toISOString().split("T")[0]);

      // Filter promotions that match user's vehicle models
      const userModels = (vehicles || []).map(v => v.model.toLowerCase());
      const matchedPromos = (promos || []).filter(promo => {
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

      // Fetch pending alerts
      const { data: alerts } = await supabase
        .from("alerts")
        .select("id, title, alert_type, status")
        .eq("user_id", user.id)
        .in("status", ["scheduled", "sent"])
        .order("due_date", { ascending: true });

      setPendingAlerts(alerts || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoClick = async (promo: Promotion) => {
    // Track promo click
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("promo_clicks").insert({
        promotion_id: promo.id,
        user_id: user.id,
        source: "home"
      });
    }
    
    toast.success("Oferta selecionada!", {
      description: "Redirecionando para agendamento...",
    });
    setShowPromos(false);
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

  const handleWaitlistClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("waitlist_interests").insert({
      user_id: user?.id || null,
      source: "home_promos"
    });
    
    toast.info("Interesse registrado!", {
      description: "Você será notificado quando tivermos promoções.",
    });
  };

  const promoCount = promotions.length;
  const alertCount = pendingAlerts.length;

  const actions = [
    {
      icon: Bell,
      label: "Lembretes",
      subtitle: alertCount > 0 ? `${alertCount} pendente${alertCount > 1 ? "s" : ""}` : "Nenhum pendente",
      color: "text-amber-500",
      badge: alertCount > 0 ? alertCount : null,
      onClick: () => navigate("/avisos"),
    },
    {
      icon: Gift,
      label: "Promoções",
      subtitle: promoCount > 0 ? `${promoCount} exclusiva${promoCount > 1 ? "s" : ""}` : "Aguarde novidades",
      color: "text-emerald-500",
      badge: promoCount > 0 ? promoCount : null,
      onClick: () => setShowPromos(true),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 animate-fade-in">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
              "glass-card hover:scale-[1.02] active:scale-[0.98] touch-target text-left"
            )}
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 relative")}>
              <action.icon className={cn("w-6 h-6", action.color)} strokeWidth={1.5} />
              {action.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-base font-medium text-foreground block">{action.label}</span>
              <span className="text-sm text-muted-foreground">{action.subtitle}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Sheet de Promoções */}
      <Sheet open={showPromos} onOpenChange={setShowPromos}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-background">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Gift className="w-6 h-6 text-emerald-500" />
              Promoções Exclusivas
            </SheetTitle>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-20 space-y-4">
            {promotions.length > 0 ? (
              promotions.map((promo) => {
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
                    className="w-full bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 rounded-xl p-4 border border-emerald-500/20 transition-all hover:border-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{promo.title}</p>
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            {promo.discount_label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {promo.description}
                        </p>
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
              })
            ) : (
              <button 
                onClick={handleWaitlistClick}
                className="w-full text-center py-12 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-dashed border-muted-foreground/30 hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-foreground font-medium">Aguarde...</p>
                    <p className="text-muted-foreground mt-1">
                      Logo você terá uma surpresa exclusiva! 🎁
                    </p>
                  </div>
                  <span className="text-sm text-primary font-medium mt-2">
                    Toque para registrar interesse
                  </span>
                </div>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
