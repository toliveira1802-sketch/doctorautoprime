import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  Wrench, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Camera,
  MessageSquare,
  Share2,
  Download,
  Printer,
  Sparkles,
  Zap,
  Award,
  ShieldCheck,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function OSUltimate() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("resumo");

  // Dados mockados de uma OS completa
  const osData = {
    numero_os: "OS-2026-0042",
    status: "em_execucao",
    placa: "ABC-1D34",
    veiculo: "Honda Civic EXL 2.0",
    cliente: {
      nome: "João Silva Santos",
      telefone: "(11) 98765-4321",
      email: "joao.silva@email.com",
      nivel: "Platina"
    },
    datas: {
      entrada: "2026-01-28",
      orcamento: "2026-01-28",
      aprovacao: "2026-01-29",
      previsao_entrega: "2026-02-02"
    },
    valores: {
      pecas: 2850.00,
      maoObra: 1200.00,
      total: 4050.00,
      desconto: 200.00,
      final: 3850.00
    },
    mecanico: {
      nome: "Carlos Mecânico",
      foto: null
    },
    progresso: 65,
    problema: "Cliente relata ruído no motor ao acelerar e perda de potência em subidas.",
    diagnostico: "Após análise, identificado problema no sistema de injeção e necessidade de limpeza dos bicos injetores. Sensor MAP apresentando leituras incorretas.",
    servicos: [
      { id: 1, nome: "Limpeza de bicos injetores", status: "concluido", valor: 350.00 },
      { id: 2, nome: "Troca do sensor MAP", status: "concluido", valor: 480.00 },
      { id: 3, nome: "Troca de velas NGK", status: "em_andamento", valor: 280.00 },
      { id: 4, nome: "Revisão sistema de ignição", status: "em_andamento", valor: 420.00 },
      { id: 5, nome: "Teste em dinamômetro", status: "pendente", valor: 180.00 },
      { id: 6, nome: "Troca óleo motor sintético", status: "pendente", valor: 340.00 }
    ],
    fotos: [
      { id: 1, tipo: "entrada", descricao: "Vista frontal - entrada" },
      { id: 2, tipo: "problema", descricao: "Sensor MAP danificado" },
      { id: 3, tipo: "problema", descricao: "Bicos injetores sujos" }
    ],
    historico: [
      { data: "2026-01-29 14:30", evento: "OS aprovada pelo cliente", usuario: "Sistema" },
      { data: "2026-01-29 10:15", evento: "Orçamento enviado", usuario: "Admin" },
      { data: "2026-01-28 16:45", evento: "Diagnóstico concluído", usuario: "Carlos" },
      { data: "2026-01-28 09:00", evento: "Veículo recebido", usuario: "Admin" }
    ]
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    diagnostico: { label: "Em Diagnóstico", color: "bg-blue-500", icon: Activity },
    orcamento: { label: "Orçamento", color: "bg-purple-500", icon: FileText },
    aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-yellow-500", icon: Clock },
    em_execucao: { label: "Em Execução", color: "bg-orange-500", icon: Wrench },
    pronto_retirada: { label: "Pronto para Retirada", color: "bg-green-500", icon: CheckCircle2 }
  };

  const statusInfo = statusConfig[osData.status] || statusConfig.diagnostico;
  const StatusIcon = statusInfo.icon;

  const servicosConcluidos = osData.servicos.filter(s => s.status === "concluido").length;
  const servicosTotal = osData.servicos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header com Gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/20 rounded-full -ml-48 -mb-48 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-white border-0", statusInfo.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    {osData.numero_os}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{osData.veiculo}</h1>
                <p className="text-xl text-red-100">{osData.placa}</p>
              </div>
              
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-100">Progresso da OS</span>
                <span className="font-bold">{osData.progresso}%</span>
              </div>
              <Progress value={osData.progresso} className="h-3 bg-red-950/50" />
              <div className="flex items-center gap-2 text-sm text-red-100">
                <Sparkles className="w-4 h-4" />
                <span>{servicosConcluidos} de {servicosTotal} serviços concluídos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Cliente</p>
                  <p className="font-semibold text-white">{osData.cliente.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-400">{osData.cliente.telefone}</p>
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                  <Award className="w-3 h-3 mr-1" />
                  {osData.cliente.nivel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Valor Total</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {osData.valores.final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {osData.valores.desconto > 0 && (
                    <p className="text-xs text-green-400">
                      Economia: R$ {osData.valores.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Previsão de Entrega</p>
                  <p className="font-semibold text-white">
                    {new Date(osData.datas.previsao_entrega).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long' 
                    })}
                  </p>
                  <p className="text-xs text-slate-400">
                    Entrada: {new Date(osData.datas.entrada).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Conteúdo */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1 w-full grid grid-cols-4">
            <TabsTrigger value="resumo" className="data-[state=active]:bg-red-600">
              <FileText className="w-4 h-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="servicos" className="data-[state=active]:bg-red-600">
              <Wrench className="w-4 h-4 mr-2" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="fotos" className="data-[state=active]:bg-red-600">
              <Camera className="w-4 h-4 mr-2" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-red-600">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumo */}
          <TabsContent value="resumo" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Problema Relatado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{osData.problema}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Diagnóstico Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{osData.diagnostico}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Peças</span>
                  <span className="font-semibold text-white">
                    R$ {osData.valores.pecas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Mão de Obra</span>
                  <span className="font-semibold text-white">
                    R$ {osData.valores.maoObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-semibold text-white">
                    R$ {osData.valores.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-green-400">
                  <span>Desconto</span>
                  <span className="font-semibold">
                    - R$ {osData.valores.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-green-400">
                    R$ {osData.valores.final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Serviços */}
          <TabsContent value="servicos" className="space-y-3">
            {osData.servicos.map((servico) => {
              const statusServicoConfig: Record<string, { color: string; icon: any; label: string }> = {
                concluido: { color: "bg-green-500", icon: CheckCircle2, label: "Concluído" },
                em_andamento: { color: "bg-orange-500", icon: Zap, label: "Em Andamento" },
                pendente: { color: "bg-slate-500", icon: Clock, label: "Pendente" }
              };
              
              const config = statusServicoConfig[servico.status];
              const ServicoIcon = config.icon;

              return (
                <Card key={servico.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.color + "/20")}>
                          <ServicoIcon className={cn("w-5 h-5", config.color.replace('bg-', 'text-'))} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{servico.nome}</p>
                          <Badge variant="outline" className="mt-1 border-slate-700 text-slate-400">
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">
                          R$ {servico.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Tab: Fotos */}
          <TabsContent value="fotos" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {osData.fotos.map((foto) => (
                <Card key={foto.id} className="bg-slate-900/50 border-slate-800 overflow-hidden group cursor-pointer hover:border-red-500 transition-colors">
                  <div className="aspect-square bg-slate-800 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-slate-600" />
                    <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/20 transition-colors" />
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-300">{foto.descricao}</p>
                    <p className="text-xs text-slate-500 mt-1">{foto.tipo}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Camera className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="historico" className="space-y-3">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {osData.historico.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        {index < osData.historico.length - 1 && (
                          <div className="w-0.5 h-12 bg-slate-700" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-white">{item.evento}</p>
                        <p className="text-sm text-slate-400">{item.data}</p>
                        <p className="text-xs text-slate-500">por {item.usuario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contatar Cliente
          </Button>
          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            <Zap className="w-4 h-4 mr-2" />
            Atualizar Status
          </Button>
        </div>

      </div>
    </div>
  );
}
