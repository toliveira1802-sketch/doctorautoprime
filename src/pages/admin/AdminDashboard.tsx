import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Car, Calendar, Users, TrendingUp, DollarSign, Wrench, Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  dashboardStatsMock,
  ordensServicoMock,
  agendamentosMock,
  clientesMock,
  empresasMock,
} from "@/lib/mockData";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [empresaSelecionada, setEmpresaSelecionada] = useState(1);
  const [loading, setLoading] = useState(false);

  // Use mock data for now
  const stats = dashboardStatsMock;

  // Métricas calculadas dos mocks
  const veiculosNoPatio = ordensServicoMock.filter(os => os.status !== "Entregue").length;
  const agendamentosHoje = agendamentosMock.filter(a => a.dataAgendamento === "2026-02-03").length;
  const novosClientesMes = clientesMock.length;
  const retornoMes = ordensServicoMock.filter(os => os.status === "Entregue").length;
  const faturadoMes = stats.faturamentoMes;
  const valorGerarHoje = ordensServicoMock
    .filter(os => os.status === "Pronto" || os.status === "Aguardando Retirada")
    .reduce((acc, os) => acc + os.valorTotalOs, 0);
  const concluidosMes = ordensServicoMock.filter(os => os.status === "Entregue").length;

  const empresaAtual = empresasMock.find(e => e.id === empresaSelecionada);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={empresaSelecionada}
            onChange={(e) => setEmpresaSelecionada(Number(e.target.value))}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            {empresasMock.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nomeEmpresa}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pendências do dia - Card de destaque */}
      <Card
        className="glass-card border-none cursor-pointer hover:scale-[1.01] transition-transform bg-gradient-to-r from-primary/10 to-primary/5"
        onClick={() => navigate('/admin/operacional')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Pendências do dia</h2>
                <p className="text-sm text-muted-foreground">Clique para ver detalhes</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{stats.osEmExecucao + stats.osAguardandoPeca + stats.osAguardandoAprovacao}</span>
              <p className="text-sm text-muted-foreground">pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Operacional, Financeiro, Produtividade, Agenda */}
      <Tabs defaultValue="operacional" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="operacional" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Operacional</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="produtividade" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Produtividade</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Agenda</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Operacional */}
        <TabsContent value="operacional">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Veículos no Pátio */}
            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/patio')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{veiculosNoPatio}</p>
                    <p className="text-xs text-muted-foreground">Veículos no Pátio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agendamentos Hoje */}
            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/agendamentos')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{agendamentosHoje}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Novos Clientes (Mês) */}
            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/clientes')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{novosClientesMes}</p>
                    <p className="text-xs text-muted-foreground">Novos Clientes (Mês)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retorno do Mês */}
            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{retornoMes}</p>
                    <p className="text-xs text-muted-foreground">Retorno do Mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Financeiro */}
        <TabsContent value="financeiro">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Faturado (Mês) */}
            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/financeiro')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">R$ {faturadoMes.toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">Faturado (Mês)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agendamentos Hoje */}
            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{agendamentosHoje}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Valor p/ Ger. Hoje */}
            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">R$ {valorGerarHoje.toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">Valor p/ Ger. Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Concluídos (Mês) */}
            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{concluidosMes}</p>
                    <p className="text-xs text-muted-foreground">Concluídos (Mês)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Produtividade */}
        <TabsContent value="produtividade">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/produtividade')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.osEmExecucao}</p>
                    <p className="text-xs text-muted-foreground">Em Execução</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{concluidosMes}</p>
                    <p className="text-xs text-muted-foreground">Concluídos (Mês)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.osAguardandoPeca}</p>
                    <p className="text-xs text-muted-foreground">Aguardando Peça</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.osAguardandoAprovacao}</p>
                    <p className="text-xs text-muted-foreground">Aguardando Aprovação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Agenda */}
        <TabsContent value="agenda">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/agendamentos')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{agendamentosHoje}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/admin/agenda-mecanicos')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.agendamentosSemana}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos Semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Agendamentos */}
            <Card className="glass-card border-none lg:row-span-2">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Agendamentos</h3>
                <div className="space-y-3">
                  {agendamentosMock.slice(0, 4).map((ag) => (
                    <div key={ag.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{ag.horaAgendamento} - {ag.dataAgendamento}</p>
                          <p className="text-xs text-muted-foreground">{ag.cliente}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">{ag.placa}</p>
                        <p className="text-xs text-muted-foreground">{ag.motivoVisita}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
