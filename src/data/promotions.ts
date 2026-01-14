// Dados compartilhados de promoções e eventos Prime
import { isWithinInterval } from "date-fns";

export interface PrimePromotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  validFrom: Date;
  validTo: Date;
  vehicleModels: string[]; // Modelos elegíveis (vazio = todos)
}

export interface PrimeEvent {
  id: string;
  type: "workshop" | "meetup" | "carwash" | "training" | "other";
  title: string;
  description: string;
  date: Date;
  location?: string;
}

// Mock de veículos do usuário (será do backend)
export const userVehicles = [
  { id: "1", model: "VW Golf", plate: "ABC-1234" },
  { id: "2", model: "Fiat Argo", plate: "XYZ-5678" },
];

// Promoções Prime exclusivas por modelo
export const mockPromotions: PrimePromotion[] = [
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

// Eventos Prime diversos
export const mockEvents: PrimeEvent[] = [
  {
    id: "1",
    type: "carwash",
    title: "Car Wash Day",
    description: "Lavagem cortesia para clientes Prime",
    date: new Date(2026, 0, 25),
    location: "Doctor Auto - Matriz",
  },
  {
    id: "2",
    type: "training",
    title: "Workshop Manutenção",
    description: "Aprenda dicas básicas de manutenção do seu veículo",
    date: new Date(2026, 1, 8),
    location: "Doctor Auto - Matriz",
  },
  {
    id: "3",
    type: "meetup",
    title: "Encontro VW Club",
    description: "Encontro exclusivo para proprietários VW",
    date: new Date(2026, 1, 15),
    location: "Parque da Cidade",
  },
];

// Helpers
export const getActivePromotions = (vehicleModels: string[]) => {
  const now = new Date();
  
  return mockPromotions.filter(promo => {
    const isActive = isWithinInterval(now, { start: promo.validFrom, end: promo.validTo });
    if (!isActive) return false;
    
    // Se não tem modelos específicos, vale para todos
    if (promo.vehicleModels.length === 0) return true;
    
    // Verifica se algum veículo do usuário é elegível
    return promo.vehicleModels.some(model => 
      vehicleModels.some(userModel => 
        userModel.toLowerCase().includes(model.toLowerCase()) ||
        model.toLowerCase().includes(userModel.toLowerCase())
      )
    );
  });
};

export const getUpcomingEvents = () => {
  const now = new Date();
  return mockEvents
    .filter(event => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const eventTypeLabels: Record<PrimeEvent["type"], { label: string; color: string }> = {
  workshop: { label: "Workshop", color: "bg-blue-500/20 text-blue-500" },
  meetup: { label: "Encontro", color: "bg-purple-500/20 text-purple-500" },
  carwash: { label: "Car Wash", color: "bg-cyan-500/20 text-cyan-500" },
  training: { label: "Treinamento", color: "bg-amber-500/20 text-amber-500" },
  other: { label: "Evento", color: "bg-muted text-muted-foreground" },
};
