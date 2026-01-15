import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog, Car, Clock, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";

const stats = [
  { label: "Veículos em Atendimento", value: "8", icon: Car, color: "text-blue-500" },
  { label: "Tempo Médio de Serviço", value: "3.2h", icon: Clock, color: "text-green-500" },
  { label: "Taxa de Conclusão", value: "96%", icon: CheckCircle, color: "text-emerald-500" },
  { label: "Serviços Pendentes", value: "4", icon: AlertTriangle, color: "text-orange-500" },
];

export default function GestaoOperacoes() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cog className="w-6 h-6 text-slate-500" />
            Operações
          </h1>
          <p className="text-muted-foreground mt-1">
            Indicadores operacionais e eficiência da oficina
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Eficiência por Mecânico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gráficos de produtividade e eficiência em breve...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Tempo Médio por Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Análise de tempo por tipo de serviço em breve...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
