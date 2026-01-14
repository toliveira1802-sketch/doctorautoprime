import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Bell, Gift, ChevronRight, X, Sparkles } from "lucide-react";
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
import { 
  userVehicles, 
  getActivePromotions,
  type PrimePromotion 
} from "@/data/promotions";

export function ActionButtons() {
  const navigate = useNavigate();
  const [showPromos, setShowPromos] = useState(false);
  const [clickedPromoIds, setClickedPromoIds] = useState<string[]>([]);
  
  const userVehicleModels = userVehicles.map(v => v.model);
  const activePromotions = getActivePromotions(userVehicleModels);
  const promoCount = activePromotions.length;

  const handlePromoClick = (promo: PrimePromotion) => {
    if (!clickedPromoIds.includes(promo.id)) {
      setClickedPromoIds(prev => [...prev, promo.id]);
      console.log(`[TRACKING] Home promo clicked: ${promo.id} - ${promo.title}`);
    }
    
    toast.success("Oferta selecionada!", {
      description: "Redirecionando para agendamento...",
    });
    setShowPromos(false);
    navigate("/novo-agendamento", { state: { promotion: promo } });
  };

  const handleWaitlistClick = () => {
    console.log("[TRACKING] Home waitlist interest clicked");
    toast.info("Interesse registrado!", {
      description: "Você será notificado quando tivermos promoções.",
    });
  };

  const actions = [
    {
      icon: Car,
      label: "Veículos",
      subtitle: userVehicles[0]?.model || "Adicionar",
      color: "text-primary",
      onClick: () => toast.info("Em breve!", { description: "Página de veículos em desenvolvimento." }),
    },
    {
      icon: Bell,
      label: "Lembrete",
      subtitle: "2 pendentes",
      color: "text-amber-500",
      onClick: () => toast.info("Em breve!", { description: "Lembretes em desenvolvimento." }),
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
            {activePromotions.length > 0 ? (
              activePromotions.map((promo) => {
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
