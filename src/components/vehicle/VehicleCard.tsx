import { Car, ChevronRight, Gauge } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  brand: string;
  model: string;
  year: number;
  plate: string;
  status: "received" | "diagnosis" | "pending" | "executing" | "ready" | "completed";
  nextService?: string;
  imageUrl?: string;
  className?: string;
}

export function VehicleCard({
  brand,
  model,
  year,
  plate,
  status,
  nextService,
  imageUrl,
  className,
}: VehicleCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-5 animate-fade-in group cursor-pointer",
        "hover:scale-[1.02] transition-transform duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {brand} {model}
            </h3>
            <p className="text-sm text-muted-foreground">
              {year} • {plate}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Vehicle Image */}
      {imageUrl && (
        <div className="relative h-36 rounded-xl overflow-hidden mb-4 gradient-glow">
          <img
            src={imageUrl}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        
        {nextService && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="w-4 h-4" />
            <span>Próxima: {nextService}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]">
        Acompanhar Serviço
      </button>
    </div>
  );
}
