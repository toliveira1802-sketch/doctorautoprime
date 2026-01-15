import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Car, Phone, AlertTriangle, 
  Clock, Loader2, CheckCircle, XCircle, User, Calendar, Cake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrdemServicoItem {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  motivo_recusa: string | null;
  prioridade: 'verde' | 'amarelo' | 'vermelho' | null;
  data_retorno_estimada: string | null;
}

interface OrdemServico {
  id: string;
  numero_os: string;
  plate: string;
  vehicle: string;
  client_name: string | null;
  client_phone: string | null;
  status: string;
  data_entrada: string | null;
  descricao_problema: string | null;
  diagnostico: string | null;
}

const prioridadeConfig: Record<string, { label: string; description: string; borderColor: string; bgColor: string; icon: React.ElementType }> = {
  vermelho: { 
    label: "Urgente", 
    description: "Troca imediata necessária - risco de segurança",
    borderColor: "border-red-500", 
    bgColor: "bg-red-500/10",
    icon: AlertTriangle
  },
  amarelo: { 
    label: "Atenção", 
    description: "Recomendamos fazer em breve",
    borderColor: "border-yellow-500", 
    bgColor: "bg-yellow-500/10",
    icon: Clock
  },
  verde: { 
    label: "Preventivo", 
    description: "Pode aguardar, mas fique atento",
    borderColor: "border-green-500", 
    bgColor: "bg-green-500/10",
    icon: CheckCircle
  },
};

export default function OrcamentoCliente() {
  const { osId } = useParams<{ osId: string }>();
  const navigate = useNavigate();

  // Fetch OS data
  const { data: os, isLoading: loadingOS } = useQuery({
    queryKey: ["ordem-servico-cliente", osId],
    queryFn: async () => {
      if (!osId) throw new Error("ID não fornecido");
      
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero_os, plate, vehicle, client_name, client_phone, status, data_entrada, descricao_problema, diagnostico")
        .eq("id", osId)
        .single();

      if (error) throw error;
      return data as OrdemServico;
    },
    enabled: !!osId,
  });

  // Fetch OS items
  const { data: itens = [], isLoading: loadingItens } = useQuery({
    queryKey: ["ordem-servico-itens-cliente", osId],
    queryFn: async () => {
      if (!osId) return [];
      
      const { data, error } = await supabase
        .from("ordens_servico_itens")
        .select("id, descricao, tipo, quantidade, valor_unitario, valor_total, status, motivo_recusa, prioridade, data_retorno_estimada")
        .eq("ordem_servico_id", osId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as OrdemServicoItem[];
    },
    enabled: !!osId,
  });

  // Fetch client profile by phone
  const { data: clientProfile } = useQuery({
    queryKey: ["client-profile", os?.client_phone],
    queryFn: async () => {
      if (!os?.client_phone) return null;
      
      const phoneDigits = os.client_phone.replace(/\D/g, '');
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, birthday")
        .or(`phone.ilike.%${phoneDigits}%,phone.ilike.%${os.client_phone}%`)
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!os?.client_phone,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatBirthday = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = parseISO(dateStr);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return null;
    }
  };

  // Calculate totals
  const totalOrcado = itens.reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const totalAprovado = itens
    .filter(item => item.status === "aprovado")
    .reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const itensPendentes = itens.filter(item => item.status === "pendente");

  // Group items by priority
  const itensUrgentes = itens.filter(i => i.prioridade === 'vermelho');
  const itensAtencao = itens.filter(i => i.prioridade === 'amarelo');
  const itensPreventivos = itens.filter(i => i.prioridade === 'verde' || !i.prioridade);

  if (loadingOS || loadingItens) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!os) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Orçamento não encontrado</h2>
        <Button onClick={() => navigate("/")}>Voltar ao Início</Button>
      </div>
    );
  }

  const renderItemCard = (item: OrdemServicoItem) => {
    const prioridade = prioridadeConfig[item.prioridade || 'verde'];
    const PrioridadeIcon = prioridade.icon;
    const isPendente = item.status === "pendente";
    const isAprovado = item.status === "aprovado";
    const isRecusado = item.status === "recusado";

    return (
      <Card 
        key={item.id} 
        className={cn(
          "border-2 transition-all",
          prioridade.borderColor,
          prioridade.bgColor,
          isRecusado && "opacity-50"
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header com criticidade */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <PrioridadeIcon className={cn(
                  "w-4 h-4",
                  item.prioridade === 'vermelho' && "text-red-600",
                  item.prioridade === 'amarelo' && "text-yellow-600",
                  item.prioridade === 'verde' && "text-green-600"
                )} />
                <Badge variant="outline" className={cn(
                  "text-xs",
                  item.prioridade === 'vermelho' && "border-red-500 text-red-600",
                  item.prioridade === 'amarelo' && "border-yellow-500 text-yellow-600",
                  item.prioridade === 'verde' && "border-green-500 text-green-600"
                )}>
                  {prioridade.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {item.tipo === 'peca' ? 'Peça' : 'Mão de Obra'}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">{item.descricao}</h3>
              <p className="text-xs text-muted-foreground mt-1">{prioridade.description}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{formatCurrency(item.valor_total)}</p>
              {item.quantidade > 1 && (
                <p className="text-xs text-muted-foreground">{item.quantidade}x {formatCurrency(item.valor_unitario)}</p>
              )}
            </div>
          </div>

          {/* Status */}
          {isAprovado && (
            <div className="flex items-center gap-2 p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Aprovado</span>
            </div>
          )}
          
          {isRecusado && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Recusado</span>
              </div>
              {item.motivo_recusa && (
                <p className="text-xs text-muted-foreground pl-2">"{item.motivo_recusa}"</p>
              )}
            </div>
          )}

          {isPendente && (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Aguardando aprovação</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const clientName = clientProfile?.full_name || os.client_name;
  const clientPhone = clientProfile?.phone || os.client_phone;
  const clientBirthday = formatBirthday(clientProfile?.birthday);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Orçamento</h1>
            <p className="text-xs text-muted-foreground">{os.numero_os}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Client Info */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardContent className="p-4 space-y-4">
            {/* Cliente */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Cliente</p>
                <h2 className="font-semibold text-lg text-foreground">{clientName || "Não informado"}</h2>
              </div>
            </div>

            {/* Telefone e Aniversário */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  {clientPhone ? (
                    <a 
                      href={`https://wa.me/55${clientPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-600 hover:underline"
                    >
                      {clientPhone}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não informado</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Aniversário</p>
                  <p className="text-sm font-medium text-foreground">
                    {clientBirthday || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-foreground">{os.vehicle}</h2>
                <p className="text-sm text-muted-foreground font-mono">{os.plate}</p>
              </div>
              {os.data_entrada && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Entrada</p>
                  <p className="text-sm font-medium">
                    {format(new Date(os.data_entrada), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
            {os.diagnostico && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Diagnóstico:</strong> {os.diagnostico}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legenda de Criticidade */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Entenda as cores:</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Urgente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Atenção</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Preventivo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itens Urgentes */}
        {itensUrgentes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-600">Itens Urgentes</h3>
              <Badge variant="destructive" className="ml-auto">{itensUrgentes.length}</Badge>
            </div>
            {itensUrgentes.map(renderItemCard)}
          </div>
        )}

        {/* Itens Atenção */}
        {itensAtencao.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-600">Requer Atenção</h3>
              <Badge className="ml-auto bg-yellow-500">{itensAtencao.length}</Badge>
            </div>
            {itensAtencao.map(renderItemCard)}
          </div>
        )}

        {/* Itens Preventivos */}
        {itensPreventivos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-600">Preventivos / Opcionais</h3>
              <Badge className="ml-auto bg-green-500">{itensPreventivos.length}</Badge>
            </div>
            {itensPreventivos.map(renderItemCard)}
          </div>
        )}
      </main>

      {/* Fixed Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total do Orçamento</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalOrcado)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Aprovado até agora</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(totalAprovado)}</p>
            </div>
          </div>
          
          {itensPendentes.length > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              {itensPendentes.length} {itensPendentes.length === 1 ? 'item aguardando' : 'itens aguardando'} aprovação
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
