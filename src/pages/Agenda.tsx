import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench, Star } from "lucide-react";
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

interface Appointment {
  id: string;
  date: Date;
  time: string;
  service: string;
  status: "confirmado" | "pendente" | "concluido";
}

interface PrimeEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
}

// Mock data - será substituído por dados do backend
const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: new Date(2026, 0, 16),
    time: "09:00",
    service: "Troca de óleo",
    status: "confirmado",
  },
  {
    id: "2",
    date: new Date(2026, 0, 20),
    time: "14:00",
    service: "Revisão completa",
    status: "pendente",
  },
];

const mockEvents: PrimeEvent[] = [
  {
    id: "1",
    title: "Car Wash Day",
    date: new Date(2026, 0, 25),
    description: "Lavagem cortesia para clientes Prime",
  },
  {
    id: "2",
    title: "Check-up Grátis",
    date: new Date(2026, 1, 5),
    description: "Diagnóstico completo sem custo",
  },
];

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
  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-4 overflow-y-auto pb-24">
        <Accordion type="multiple" defaultValue={["agendamentos", "agendar", "eventos"]} className="space-y-3">
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
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-background/50 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{apt.service}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(apt.date, "dd/MM", { locale: ptBR })} às {apt.time}
                          </span>
                        </div>
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
                  ))}
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
              <Button className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                Solicitar Agendamento
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* 3. PRÓXIMOS EVENTOS PRIME */}
          <AccordionItem value="eventos" className="glass-card rounded-xl border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-base font-semibold text-foreground">Próximos Eventos Prime</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {mockEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-background/50 rounded-xl p-4 border-l-4 border-primary"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      </div>
                      <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                        {format(event.date, "dd MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Agenda;
