import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  User, TrendingUp, TrendingDown, Car, Calendar, 
  Target, RefreshCw, Award, Medal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, getWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MechanicProduction {
  id: string;
  name: string;
  emoji?: string;
  valorProduzido: number;
  carrosEntregues: number;
  metaSemanal: number;
  metaMensal: number;
}

type PeriodFilter = 'semana1' | 'semana2' | 'semana3' | 'semana4' | 'mes';

const MECHANIC_EMOJIS: Record<string, string> = {
  'Samuel': '🐦',
  'Tadeu': '🦅',
  'Aldo': '🦉',
  'JP': '🦆',
  'Wendel': '🦜',
};

export default function AdminProdutividade() {
  const [mechanics, setMechanics] = useState<MechanicProduction[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>('mes');
  const [loading, setLoading] = useState(true);
  const [totalProduzido, setTotalProduzido] = useState(0);
  const [totalCarros, setTotalCarros] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;
      let isSemanal = false;

      switch (period) {
        case 'semana1':
          startDate = startOfMonth(today);
          endDate = addWeeks(startDate, 1);
          isSemanal = true;
          break;
        case 'semana2':
          startDate = addWeeks(startOfMonth(today), 1);
          endDate = addWeeks(startDate, 1);
          isSemanal = true;
          break;
        case 'semana3':
          startDate = addWeeks(startOfMonth(today), 2);
          endDate = addWeeks(startDate, 1);
          isSemanal = true;
          break;
        case 'semana4':
          startDate = addWeeks(startOfMonth(today), 3);
          endDate = endOfMonth(today);
          isSemanal = true;
          break;
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
      }

      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      // Fetch mechanics
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true);

      // Fetch metas
      const mes = today.getMonth() + 1;
      const ano = today.getFullYear();
      const { data: metasData } = await supabase
        .from('metas_mecanicos')
        .select('*')
        .eq('mes', mes)
        .eq('ano', ano);

      // Fetch production by mechanic
      const { data: productionData } = await supabase
        .from('appointments')
        .select(`
          mechanic_id,
          final_price
        `)
        .eq('status', 'concluido')
        .gte('actual_completion', startStr)
        .lte('actual_completion', endStr);

      // Aggregate by mechanic
      const productionByMechanic: Record<string, { valor: number; carros: number }> = {};
      productionData?.forEach(p => {
        if (p.mechanic_id) {
          if (!productionByMechanic[p.mechanic_id]) {
            productionByMechanic[p.mechanic_id] = { valor: 0, carros: 0 };
          }
          productionByMechanic[p.mechanic_id].valor += p.final_price || 0;
          productionByMechanic[p.mechanic_id].carros += 1;
        }
      });

      // Build mechanics list with production
      const mechanicsList: MechanicProduction[] = (mechanicsData || []).map(m => {
        const production = productionByMechanic[m.id] || { valor: 0, carros: 0 };
        const meta = metasData?.find(mt => mt.mechanic_id === m.id);
        
        return {
          id: m.id,
          name: m.name,
          emoji: MECHANIC_EMOJIS[m.name.split(' ')[0]] || '👤',
          valorProduzido: production.valor,
          carrosEntregues: production.carros,
          metaSemanal: meta?.meta_semanal || 25000,
          metaMensal: meta?.meta_mensal || 100000,
        };
      });

      // Sort by production
      mechanicsList.sort((a, b) => b.valorProduzido - a.valorProduzido);

      setMechanics(mechanicsList);
      setTotalProduzido(mechanicsList.reduce((sum, m) => sum + m.valorProduzido, 0));
      setTotalCarros(mechanicsList.reduce((sum, m) => sum + m.carrosEntregues, 0));

    } catch (error) {
      console.error('Error fetching production data:', error);
      toast.error("Erro ao carregar dados de produtividade");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getCurrentWeek = () => {
    const weekInMonth = Math.ceil(new Date().getDate() / 7);
    return `Semana ${weekInMonth}`;
  };

  const getMeta = (mechanic: MechanicProduction) => {
    return period === 'mes' ? mechanic.metaMensal : mechanic.metaSemanal;
  };

  const getProgressColor = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-destructive';
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Medal className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-700" />;
      default: return <span className="text-sm text-muted-foreground">{index + 1}º</span>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Produtividade dos Mecânicos</h1>
            <p className="text-muted-foreground">
              {getCurrentWeek()} - {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana1">Semana 1</SelectItem>
                <SelectItem value="semana2">Semana 2</SelectItem>
                <SelectItem value="semana3">Semana 3</SelectItem>
                <SelectItem value="semana4">Semana 4</SelectItem>
                <SelectItem value="mes">Mês Todo</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Produzido</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalProduzido)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Carros Entregues</p>
                  <p className="text-2xl font-bold">{totalCarros}</p>
                </div>
                <Car className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalCarros > 0 ? totalProduzido / totalCarros : 0)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mecânicos Ativos</p>
                  <p className="text-2xl font-bold">{mechanics.length}</p>
                </div>
                <User className="w-8 h-8 text-violet" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mechanics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mechanics.map((mechanic, index) => {
            const meta = getMeta(mechanic);
            const percentage = meta > 0 ? (mechanic.valorProduzido / meta) * 100 : 0;
            const metaAtingida = percentage >= 100;

            return (
              <Card 
                key={mechanic.id}
                className={`relative overflow-hidden transition-all ${
                  metaAtingida ? 'ring-2 ring-success border-success/30' : ''
                }`}
              >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4">
                  {getRankIcon(index)}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{mechanic.emoji}</span>
                    <span className="text-lg">{mechanic.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold">
                      {formatCurrency(mechanic.valorProduzido)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mechanic.carrosEntregues} {mechanic.carrosEntregues === 1 ? 'carro' : 'carros'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meta {period === 'mes' ? 'Mensal' : 'Semanal'}</span>
                      <span className={metaAtingida ? 'text-success font-medium' : ''}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Meta: {formatCurrency(meta)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    {metaAtingida ? (
                      <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Meta Atingida!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        <span className="text-sm">
                          Falta: {formatCurrency(Math.max(0, meta - mechanic.valorProduzido))}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Terceirizados Card */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <span className="text-lg">TERCEIRIZADO</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-muted-foreground">
                  {formatCurrency(0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  0 carros
                </p>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Serviços terceirizados
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
