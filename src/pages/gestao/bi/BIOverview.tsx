import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BIOverview() {
    const navigate = useNavigate();

    const dashboards = [
        {
            title: "Conversão de Orçamentos",
            description: "Taxa de aprovação, tempo médio, funil de vendas",
            icon: Target,
            color: "text-blue-600",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            route: "/gestao/bi/conversao",
            metrics: [
                { label: "Taxa de Aprovação", value: "68%" },
                { label: "Ticket Médio", value: "R$ 1.850" },
            ]
        },
        {
            title: "Análise de Margens",
            description: "Margem média, descontos, rentabilidade por tipo",
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/20",
            route: "/gestao/bi/margens",
            metrics: [
                { label: "Margem Média", value: "42%" },
                { label: "Descontos Aplicados", value: "R$ 3.200" },
            ]
        },
        {
            title: "Oportunidades de Retorno",
            description: "Itens recusados, campanhas sugeridas, follow-up",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/20",
            route: "/gestao/bi/oportunidades",
            metrics: [
                { label: "Valor em Oportunidades", value: "R$ 12.500" },
                { label: "Clientes para Retorno", value: "23" },
            ]
        },
        {
            title: "Segmentação de Clientes",
            description: "VIPs, econômicos, preventivos, padrões de compra",
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            route: "/gestao/bi/clientes",
            metrics: [
                { label: "Clientes VIP", value: "45" },
                { label: "Taxa de Retorno", value: "72%" },
            ]
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary" />
                    Business Intelligence
                </h1>
                <p className="text-muted-foreground mt-2">
                    Análise de dados, métricas e insights para tomada de decisão
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">OSs Este Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">127</div>
                        <p className="text-xs text-green-600 mt-1">+12% vs mês anterior</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">R$ 235k</div>
                        <p className="text-xs text-green-600 mt-1">+8% vs mês anterior</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Conversão</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">68%</div>
                        <p className="text-xs text-red-600 mt-1">-3% vs mês anterior</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">342</div>
                        <p className="text-xs text-green-600 mt-1">+15 novos este mês</p>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboards.map((dashboard) => {
                    const Icon = dashboard.icon;
                    return (
                        <Card
                            key={dashboard.route}
                            className={`${dashboard.bgColor} border-2 ${dashboard.borderColor} hover:shadow-lg transition-all cursor-pointer group`}
                            onClick={() => navigate(dashboard.route)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${dashboard.bgColor} border ${dashboard.borderColor}`}>
                                            <Icon className={`w-6 h-6 ${dashboard.color}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                                            <CardDescription className="mt-1">{dashboard.description}</CardDescription>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {dashboard.metrics.map((metric, idx) => (
                                        <div key={idx}>
                                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                                            <p className={`text-xl font-bold ${dashboard.color} mt-1`}>{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Coming Soon */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Próximos Dashboards
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                        <div>• Análise de Sazonalidade</div>
                        <div>• Performance por Mecânico</div>
                        <div>• Tempo Médio de Execução</div>
                        <div>• Itens Mais Vendidos</div>
                        <div>• Análise de Estoque</div>
                        <div>• Previsão de Demanda</div>
                        <div>• Satisfação do Cliente</div>
                        <div>• ROI de Campanhas</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
