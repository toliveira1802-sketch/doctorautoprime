import { useNavigate } from "react-router-dom";
import { Car, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <button
        onClick={() => navigate("/novo-agendamento")}
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
          "glass-card hover:scale-[1.02] active:scale-[0.98] touch-target text-left"
        )}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20">
          <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <span className="text-base font-medium text-foreground block">Agendar Serviço</span>
          <span className="text-sm text-muted-foreground">Revisão ou diagnóstico</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
