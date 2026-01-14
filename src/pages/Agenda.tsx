import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  service: string;
  status: "confirmado" | "pendente" | "concluido";
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filtrar agendamentos do dia selecionado
  const dayAppointments = mockAppointments.filter(
    (apt) =>
      selectedDate &&
      apt.date.toDateString() === selectedDate.toDateString()
  );

  // Próximos agendamentos (todos)
  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Dias com agendamentos para destacar no calendário
  const daysWithAppointments = mockAppointments.map((apt) => apt.date);

  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-4 flex flex-col overflow-hidden">
        {/* Calendar */}
        <section className="glass-card rounded-2xl p-4 mb-4">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className="pointer-events-auto mx-auto"
            modifiers={{
              hasAppointment: daysWithAppointments,
            }}
            modifiersStyles={{
              hasAppointment: {
                fontWeight: "bold",
                textDecoration: "underline",
                textDecorationColor: "hsl(var(--primary))",
              },
            }}
          />
        </section>

        {/* Appointments Summary */}
        <section className="flex-1 overflow-y-auto pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {selectedDate
                ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                : "Próximos agendamentos"}
            </h3>
          </div>

          {dayAppointments.length > 0 ? (
            <div className="space-y-3">
              {dayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{apt.service}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{apt.time}</span>
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
          ) : selectedDate ? (
            <div className="glass-card rounded-xl p-6 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Nenhum agendamento neste dia
              </p>
            </div>
          ) : null}

          {/* Upcoming if no date selected or showing all */}
          {!selectedDate && upcomingAppointments.length > 0 && (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary" strokeWidth={1.5} />
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
          )}
        </section>

        {/* New Appointment Button */}
        <section className="py-4">
          <Button className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Solicitar Agendamento
          </Button>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Agenda;
