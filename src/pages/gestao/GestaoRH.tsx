import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Users, Clock, Award, TrendingUp, Calendar } from "lucide-react";

const stats = [
  { label: "Colaboradores Ativos", value: "12", icon: Users, color: "text-blue-500" },
  { label: "Horas Trabalhadas (Mês)", value: "1.920", icon: Clock, color: "text-green-500" },
  { label: "Taxa de Retenção", value: "94%", icon: Award, color: "text-purple-500" },
  { label: "Produtividade Média", value: "87%", icon: TrendingUp, color: "text-orange-500" },
];

export default function GestaoRH() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCog className="w-6 h-6 text-blue-500" />
            Recursos Humanos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de pessoas e indicadores de RH
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
                <Calendar className="w-5 h-5" />
                Agenda de RH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Calendário de férias, treinamentos e avaliações em breve...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lista de colaboradores e organograma em breve...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
