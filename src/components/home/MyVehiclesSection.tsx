import { useNavigate } from "react-router-dom";
import { Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MyVehiclesSection() {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in">
      <Button
        variant="outline"
        className="w-full justify-between h-14 glass-card border-0 hover:bg-muted/50"
        onClick={() => navigate("/meus-veiculos")}
      >
        <div className="flex items-center gap-3">
          <Car className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Meus Veículos</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Button>
    </section>
  );
}
