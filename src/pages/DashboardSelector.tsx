import { useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardSelector() {
  const navigate = useNavigate();

  const dashboards = [
    {
      id: "admin",
      title: "Admin",
      description: "Visão Operacional - Gestão do dia a dia da oficina",
      icon: LayoutDashboard,
      color: "from-red-500 to-red-600",
      path: "/admin",
      features: [
        "Pátio e Kanban",
        "Agendamentos",
        "Ordens de Serviço",
        "Cadastros",
      ],
    },
    {
      id: "gestao",
      title: "Gestão",
      description: "Visão Estratégica - Indicadores e análises gerenciais",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      path: "/gestao",
      features: [
        "KPIs e Métricas",
        "Análise Financeira",
        "Performance de Equipe",
        "Relatórios Gerenciais",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Selecione sua Visão
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha o dashboard que melhor atende suas necessidades
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <Card
                key={dashboard.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary overflow-hidden"
                onClick={() => navigate(dashboard.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${dashboard.color}`} />
                <CardContent className="p-8 space-y-6">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-br ${dashboard.color} text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{dashboard.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {dashboard.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Funcionalidades:
                    </p>
                    <ul className="space-y-2">
                      {dashboard.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(dashboard.path)}
                  >
                    Acessar {dashboard.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Você pode alternar entre as visões a qualquer momento através do
            menu
          </p>
        </div>
      </div>
    </div>
  );
}
