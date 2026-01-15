import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, CreditCard } from "lucide-react";

const stats = [
  { label: "Faturamento (Mês)", value: "R$ 85.420", icon: DollarSign, color: "text-green-500" },
  { label: "Ticket Médio", value: "R$ 890", icon: Receipt, color: "text-blue-500" },
  { label: "Lucro Líquido", value: "R$ 32.150", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Despesas", value: "R$ 53.270", icon: TrendingDown, color: "text-red-500" },
];

export default function GestaoFinanceiro() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral financeira e indicadores de rentabilidade
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
                <PiggyBank className="w-5 h-5" />
                Fluxo de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gráfico de fluxo de caixa mensal em breve...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Contas a Receber / Pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestão de contas e pagamentos em breve...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
