import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Users, Target, TrendingUp, Share2, Eye } from "lucide-react";

const stats = [
  { label: "Novos Clientes (Mês)", value: "24", icon: Users, color: "text-blue-500" },
  { label: "Taxa de Conversão", value: "32%", icon: Target, color: "text-green-500" },
  { label: "Engajamento", value: "4.2k", icon: Eye, color: "text-purple-500" },
  { label: "Crescimento", value: "+18%", icon: TrendingUp, color: "text-emerald-500" },
];

export default function GestaoComercial() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-orange-500" />
            Comercial e Marketing
          </h1>
          <p className="text-muted-foreground mt-1">
            Indicadores comerciais, campanhas e aquisição de clientes
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
                <Megaphone className="w-5 h-5" />
                Campanhas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestão de campanhas e promoções em breve...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Métricas de redes sociais em breve...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
