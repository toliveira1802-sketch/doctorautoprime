import { useState } from "react";
import { ChevronDown, ChevronUp, Wrench, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ServiceItem {
  id: string;
  date: string;
  vehicleModel: string;
  services: string[];
  total: number;
  status: "completed" | "cancelled";
}

// Mock data - will be replaced with real data
const mockHistory: ServiceItem[] = [
  {
    id: "1",
    date: "2024-01-10",
    vehicleModel: "VW Golf",
    services: ["Revisão 30.000km", "Troca de óleo"],
    total: 890,
    status: "completed",
  },
  {
    id: "2",
    date: "2023-10-15",
    vehicleModel: "VW Golf",
    services: ["Revisão 20.000km"],
    total: 650,
    status: "completed",
  },
  {
    id: "3",
    date: "2023-07-20",
    vehicleModel: "VW Golf",
    services: ["Diagnóstico", "Troca de pastilhas"],
    total: 450,
    status: "completed",
  },
];

export function ServiceHistory() {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalSpent = mockHistory.reduce((acc, item) => acc + item.total, 0);

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
                    {mockHistory.length} serviços realizados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  R$ {totalSpent.toLocaleString()}
                </Badge>
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
            {mockHistory.map((item) => (
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
                    {item.services.join(", ")}
                  </p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    R$ {item.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {mockHistory.length === 0 && (
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
