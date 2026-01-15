import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Server, Shield, Activity, Database, Wifi } from "lucide-react";

const stats = [
  { label: "Uptime do Sistema", value: "99.9%", icon: Activity, color: "text-green-500" },
  { label: "Usuários Ativos", value: "156", icon: Laptop, color: "text-blue-500" },
  { label: "Segurança", value: "Alta", icon: Shield, color: "text-emerald-500" },
  { label: "Dados Armazenados", value: "2.4 GB", icon: Database, color: "text-purple-500" },
];

export default function GestaoTecnologia() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Laptop className="w-6 h-6 text-purple-500" />
            Tecnologia
          </h1>
          <p className="text-muted-foreground mt-1">
            Infraestrutura, sistemas e indicadores de TI
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
                <Server className="w-5 h-5" />
                Status dos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitoramento de serviços e APIs em breve...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Integrações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Status das integrações externas em breve...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
