import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BIConversao() {
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
                            <Target className="w-8 h-8 text-blue-600" />
                            Conversão de Orçamentos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Análise de aprovação, recusa e padrões de conversão
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
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aprovação Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">68%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">+5% vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio Aprovado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">R$ 1.850</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">+12% vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Médio de Aprovação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">4.2h</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">-1.3h vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Orçamentos Este Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">127</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">+18 vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Taxa de Aprovação por Prioridade</CardTitle>
                        <CardDescription>Comparação entre itens urgentes, atenção e preventivos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Gráfico de Barras</p>
                                <p className="text-xs mt-1">Vermelho: 95% | Amarelo: 60% | Verde: 25%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Funil de Conversão</CardTitle>
                        <CardDescription>Orçado → Aprovado → Executado → Entregue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Gráfico de Funil</p>
                                <p className="text-xs mt-1">100% → 68% → 62% → 58%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Evolução da Taxa de Aprovação</CardTitle>
                        <CardDescription>Últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Gráfico de Linha</p>
                                <p className="text-xs mt-1">Tendência de crescimento</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Status</CardTitle>
                        <CardDescription>Aprovado vs Parcial vs Recusado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Gráfico de Pizza</p>
                                <p className="text-xs mt-1">Aprovado: 68% | Parcial: 20% | Recusado: 12%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Orçamentos Recentes</CardTitle>
                    <CardDescription>Últimas 10 OSs com detalhes de conversão</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <p>Tabela de Dados</p>
                            <p className="text-xs mt-1">OS | Cliente | Valor Orçado | Valor Aprovado | Taxa | Status</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Placeholder component
function BarChart({ className }: { className?: string }) {
    return <div className={className}>📊</div>;
}
