// Analytics de funil de agendamento
// TODO: Enviar para o backend quando tivermos a API

export type FunnelStep = 
  | "flow_started"        // Entrou no fluxo
  | "vehicle_selected"    // Selecionou veículo
  | "type_selected"       // Selecionou tipo
  | "services_selected"   // Selecionou serviços
  | "date_selected"       // Selecionou data
  | "flow_completed"      // Finalizou agendamento
  | "flow_abandoned";     // Abandonou o fluxo

export type FlowType = "normal" | "promo";

export interface FunnelEvent {
  eventType: FunnelStep;
  flowType: FlowType;
  promoId?: string;
  promoTitle?: string;
  vehicleModel?: string;
  stepNumber: number;
  totalSteps: number;
  timestamp: Date;
  sessionId: string;
}

// Gera um session ID único para esta sessão de agendamento
let currentSessionId: string | null = null;

export const generateSessionId = (): string => {
  currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return currentSessionId;
};

export const getCurrentSessionId = (): string => {
  if (!currentSessionId) {
    return generateSessionId();
  }
  return currentSessionId;
};

export const clearSession = () => {
  currentSessionId = null;
};

// Armazena eventos localmente (será substituído por chamada API)
const pendingEvents: FunnelEvent[] = [];

export const trackFunnelEvent = (event: Omit<FunnelEvent, "timestamp" | "sessionId">) => {
  const fullEvent: FunnelEvent = {
    ...event,
    timestamp: new Date(),
    sessionId: getCurrentSessionId(),
  };
  
  pendingEvents.push(fullEvent);
  
  // Log para debug
  const emoji = event.eventType === "flow_completed" ? "✅" : 
                event.eventType === "flow_abandoned" ? "❌" : "📊";
  
  console.log(
    `${emoji} [FUNNEL] ${event.eventType}`,
    {
      flow: event.flowType,
      step: `${event.stepNumber}/${event.totalSteps}`,
      promo: event.promoTitle || "-",
      vehicle: event.vehicleModel || "-",
    }
  );
  
  // TODO: Enviar para o backend
  // await supabase.from('funnel_events').insert(fullEvent);
};

// Resumo de abandono para análise
export const getAbandonmentSummary = () => {
  const abandoned = pendingEvents.filter(e => e.eventType === "flow_abandoned");
  const completed = pendingEvents.filter(e => e.eventType === "flow_completed");
  
  return {
    totalStarted: pendingEvents.filter(e => e.eventType === "flow_started").length,
    totalCompleted: completed.length,
    totalAbandoned: abandoned.length,
    abandonedAtStep: abandoned.reduce((acc, e) => {
      const key = `step_${e.stepNumber}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    lastStepAbandonment: abandoned.filter(e => e.stepNumber === e.totalSteps - 1).length,
  };
};

// Expõe para debug no console
if (typeof window !== "undefined") {
  (window as any).getFunnelAnalytics = () => {
    const summary = getAbandonmentSummary();
    console.table(summary);
    console.log("Eventos detalhados:", pendingEvents);
    return { summary, events: pendingEvents };
  };
}
