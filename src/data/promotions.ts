// Tipos compartilhados de promoções e eventos Prime
// NOTA: Os dados agora vêm do banco de dados (tabelas: promotions, events)

import { isWithinInterval } from "date-fns";

export interface PrimePromotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  discountPercent: number;
  validFrom: Date;
  validTo: Date;
  vehicleModels: string[];
  serviceId?: string;
  serviceName?: string;
  availableDates?: Date[];
}

export interface PrimeEvent {
  id: string;
  type: "workshop" | "meetup" | "carwash" | "training" | "other";
  title: string;
  description: string;
  date: Date;
  location?: string;
}

// Helpers para filtrar promoções do banco
export const filterActivePromotions = (
  promotions: PrimePromotion[],
  vehicleModels: string[]
) => {
  const now = new Date();

  return promotions.filter((promo) => {
    const isActive = isWithinInterval(now, {
      start: promo.validFrom,
      end: promo.validTo,
    });
    if (!isActive) return false;

    // Se não tem modelos específicos, vale para todos
    if (promo.vehicleModels.length === 0) return true;

    // Verifica se algum veículo do usuário é elegível
    return promo.vehicleModels.some((model) =>
      vehicleModels.some(
        (userModel) =>
          userModel.toLowerCase().includes(model.toLowerCase()) ||
          model.toLowerCase().includes(userModel.toLowerCase())
      )
    );
  });
};

export const filterUpcomingEvents = (events: PrimeEvent[]) => {
  const now = new Date();
  return events
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const eventTypeLabels: Record<
  PrimeEvent["type"],
  { label: string; color: string }
> = {
  workshop: { label: "Workshop", color: "bg-blue-500/20 text-blue-500" },
  meetup: { label: "Encontro", color: "bg-purple-500/20 text-purple-500" },
  carwash: { label: "Car Wash", color: "bg-cyan-500/20 text-cyan-500" },
  training: { label: "Treinamento", color: "bg-amber-500/20 text-amber-500" },
  other: { label: "Evento", color: "bg-muted text-muted-foreground" },
};
