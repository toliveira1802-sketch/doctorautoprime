import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Filter, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BIMargens() {
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/gestao/bi")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            Análise de Margens
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Rentabilidade, descontos e performance financeira
                        </p>
                    </div>
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Margem Média Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">42%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">+2% vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Margem em Peças</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">38%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-600">-1% vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Margem em Serviços</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">85%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">+3% vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Descontos Aplicados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">R$ 3.2k</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-orange-600">+R$ 800 vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            <Card className="border-orange-500/50 bg-orange-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="w-5 h-5" />
                        Alertas de Margem
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span>3 itens vendidos com margem abaixo de 20%</span>
                            <Button size="sm" variant="outline">Ver Detalhes</Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span>Desconto de 25% aplicado em OS-2024-089 sem justificativa</span>
                            <Button size="sm" variant="outline">Revisar</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Margens</CardTitle>
                        <CardDescription>Histograma de margens aplicadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <p>Gráfico de Histograma</p>
                                <p className="text-xs mt-1">0-20%: 5 | 20-40%: 45 | 40-60%: 60 | 60%+: 17</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Margem Média por Tipo</CardTitle>
                        <CardDescription>Peças vs Mão de Obra</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <p>Gráfico de Barras Comparativo</p>
                                <p className="text-xs mt-1">Peças: 38% | Serviços: 85%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Evolução da Margem</CardTitle>
                        <CardDescription>Últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <p>Gráfico de Linha</p>
                                <p className="text-xs mt-1">Tendência estável com leve crescimento</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Itens com Menor Margem</CardTitle>
                        <CardDescription>Oportunidades de ajuste de preço</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <p>Tabela Ranqueada</p>
                                <p className="text-xs mt-1">Item | Margem | Frequência | Ação Sugerida</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
