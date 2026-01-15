import { useState } from "react";
import { Instagram, Youtube, ChevronDown, ChevronUp, Wrench, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface ServiceItem {
  id: string;
  date: string;
  vehicleModel: string;
  plate: string;
  services: string[];
  total: number;
  status: "completed" | "cancelled";
  cashback: number; // 15% do total
}

// Mock data - will be replaced with real data
const mockHistory: ServiceItem[] = [
  {
    id: "1",
    date: "2024-01-10",
    vehicleModel: "VW Golf",
    plate: "ABC-1234",
    services: ["Revisão 30.000km", "Troca de óleo"],
    total: 890,
    status: "completed",
    cashback: 133.50, // 15% de 890
  },
  {
    id: "2",
    date: "2023-10-15",
    vehicleModel: "VW Golf",
    plate: "ABC-1234",
    services: ["Revisão 20.000km"],
    total: 650,
    status: "completed",
    cashback: 97.50, // 15% de 650
  },
  {
    id: "3",
    date: "2023-07-20",
    vehicleModel: "VW Golf",
    plate: "ABC-1234",
    services: ["Diagnóstico", "Troca de pastilhas"],
    total: 450,
    status: "completed",
    cashback: 67.50, // 15% de 450
  },
  {
    id: "4",
    date: "2023-04-05",
    vehicleModel: "VW Polo",
    plate: "XYZ-5678",
    services: ["Revisão 10.000km"],
    total: 420,
    status: "cancelled",
    cashback: 0,
  },
];

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@drprime_oficial",
    url: "https://instagram.com/drprime_oficial",
    color: "from-purple-500 via-pink-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10",
  },
  {
    icon: Youtube,
    label: "YouTube",
    handle: "Dr. Prime",
    url: "https://youtube.com/@drprime",
    color: "from-red-600 to-red-500",
    bgColor: "bg-red-500/10",
  },
];

export default function Historico() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const completedServices = mockHistory.filter(s => s.status === "completed");
  const totalCashback = completedServices.reduce((acc, item) => acc + item.cashback, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary p-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Histórico</h1>
        <p className="text-white/80 mt-1">Seus serviços realizados</p>
        
        {/* Cashback Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Seu cashback disponível</p>
              <p className="text-white text-2xl font-bold">R$ {totalCashback.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white border-0">
                15% de volta
              </Badge>
              <p className="text-white/70 text-xs mt-1">para usar em serviços</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Service History */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockHistory.map((item) => (
              <Collapsible
                key={item.id}
                open={expandedId === item.id}
                onOpenChange={(open) => setExpandedId(open ? item.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
                      item.status === "completed" 
                        ? "bg-muted/50 hover:bg-muted" 
                        : "bg-destructive/5 hover:bg-destructive/10"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.status === "completed" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{item.vehicleModel}</p>
                        <Badge variant={item.status === "completed" ? "default" : "destructive"}>
                          {item.status === "completed" ? "Concluído" : "Cancelado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.plate}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary">R$ {item.total}</p>
                      {expandedId === item.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="ml-13 pl-4 border-l-2 border-muted mt-2 mb-2 space-y-2">
                    <p className="text-sm font-medium">Serviços:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {item.services.map((service, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {service}
                        </li>
                      ))}
                    </ul>
                    {item.status === "completed" && (
                      <p className="text-sm text-green-600 font-medium">
                        +R$ {item.cashback.toFixed(2).replace('.', ',')} de cashback
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {mockHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum serviço realizado ainda</p>
                <p className="text-sm">Agende seu primeiro serviço!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Social Links */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Siga a Dr. Prime</h2>
          
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className={`border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow ${social.bgColor}`}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg`}>
                    <social.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{social.label}</p>
                    <p className="text-sm text-muted-foreground">{social.handle}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Extra space for bottom nav */}
        <div className="h-4" />
      </div>

      <BottomNavigation />
    </div>
  );
}
