import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Wrench, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface ServiceItem {
  id: string;
  date: string;
  vehicleModel: string;
  services: string[];
  total: number;
  status: "completed" | "cancelled";
}

export function ServiceHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          status,
          final_price,
          vehicles (model, brand),
          appointment_services (
            services (name)
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "concluido")
        .order("appointment_date", { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedHistory: ServiceItem[] = (appointments || []).map((apt: any) => ({
        id: apt.id,
        date: apt.appointment_date,
        vehicleModel: apt.vehicles ? `${apt.vehicles.brand || ''} ${apt.vehicles.model}`.trim() : "Veículo",
        services: apt.appointment_services?.map((as: any) => as.services?.name).filter(Boolean) || [],
        total: Number(apt.final_price) || 0,
        status: "completed",
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching service history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalSpent = history.reduce((acc, item) => acc + item.total, 0);

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Histórico de Serviços</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {history.length} serviço{history.length !== 1 ? 's' : ''} realizado{history.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totalSpent > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    R$ {totalSpent.toLocaleString()}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{item.vehicleModel}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.services.length > 0 ? item.services.join(", ") : "Serviço"}
                  </p>
                  {item.total > 0 && (
                    <p className="text-sm font-semibold text-primary mt-1">
                      R$ {item.total.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum serviço realizado ainda</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
