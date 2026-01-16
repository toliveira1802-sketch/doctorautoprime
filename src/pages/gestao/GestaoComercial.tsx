import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ExportButtons } from "@/components/gestao/ExportButtons";
import { CustomizableDashboard } from "@/components/gestao/CustomizableDashboard";
import { exportToPDF, exportToExcel, type ReportData } from "@/utils/exportReport";
import { Megaphone, Users, Target, TrendingUp, Loader2, Eye, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PromoStats {
  id: string;
  title: string;
  clicks: number;
}

interface EditableKpis {
  totalClients: number;
  newClients: number;
  promoClicks: number;
  activePromos: number;
  conversionRate: number;
  averageTicket: number;
  monthlyRevenue: number;
  leadCount: number;
}

export default function GestaoComercial() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [kpis, setKpis] = useState<EditableKpis>({
    totalClients: 0,
    newClients: 0,
    promoClicks: 0,
    activePromos: 0,
    conversionRate: 0,
    averageTicket: 0,
    monthlyRevenue: 0,
    leadCount: 0,
  });
  const [editedKpis, setEditedKpis] = useState<EditableKpis>(kpis);
  const [promoStats, setPromoStats] = useState<PromoStats[]>([]);
  const [dailyClients, setDailyClients] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      // Buscar dados manuais salvos
      const { data: manualData } = await supabase
        .from("gestao_dados_manuais")
        .select("chave, valor")
        .eq("data_referencia", format(new Date(), "yyyy-MM-01"));

      const manualMap: Record<string, string> = {};
      manualData?.forEach(d => {
        manualMap[d.chave] = d.valor;
      });

      // Total de clientes
      const { count: totalClients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Novos clientes do mês
      const { count: newClients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      // Promoções ativas
      const { data: promotions } = await supabase
        .from("promotions")
        .select("id, title, is_active")
        .eq("is_active", true)
        .gte("valid_to", new Date().toISOString().split("T")[0]);

      // Cliques em promoções
      const { data: promoClicks } = await supabase
        .from("promo_clicks")
        .select("id, promotion_id")
        .gte("clicked_at", startOfMonth.toISOString());

      // Agrupar cliques por promoção
      const clickMap: Record<string, number> = {};
      promoClicks?.forEach(click => {
        clickMap[click.promotion_id] = (clickMap[click.promotion_id] || 0) + 1;
      });

      const promoWithClicks = promotions?.map(p => ({
        id: p.id,
        title: p.title,
        clicks: clickMap[p.id] || 0,
      })) || [];

      // Buscar perfis criados nos últimos 7 dias
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      // Agrupar por dia
      const dailyMap: Record<string, number> = {};
      recentProfiles?.forEach(p => {
        const date = format(new Date(p.created_at), "dd/MM");
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });

      const dailyData = Object.entries(dailyMap).map(([date, count]) => ({
        date,
        count,
      }));

      const newKpis: EditableKpis = {
        totalClients: Number(manualMap["totalClients"]) || totalClients || 0,
        newClients: Number(manualMap["newClients"]) || newClients || 0,
        promoClicks: Number(manualMap["promoClicks"]) || promoClicks?.length || 0,
        activePromos: Number(manualMap["activePromos"]) || promotions?.length || 0,
        conversionRate: Number(manualMap["conversionRate"]) || 0,
        averageTicket: Number(manualMap["averageTicket"]) || 0,
        monthlyRevenue: Number(manualMap["monthlyRevenue"]) || 0,
        leadCount: Number(manualMap["leadCount"]) || 0,
      };

      setKpis(newKpis);
      setEditedKpis(newKpis);
      setPromoStats(promoWithClicks);
      setDailyClients(dailyData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveKpis() {
    try {
      const dataReferencia = format(new Date(), "yyyy-MM-01");
      
      const updates = Object.entries(editedKpis).map(([chave, valor]) => ({
        chave,
        valor: String(valor),
        data_referencia: dataReferencia,
      }));

      // Deletar valores anteriores do mês
      await supabase
        .from("gestao_dados_manuais")
        .delete()
        .eq("data_referencia", dataReferencia);

      // Inserir novos valores
      const { error } = await supabase
        .from("gestao_dados_manuais")
        .insert(updates);

      if (error) throw error;

      setKpis(editedKpis);
      setIsEditing(false);
      toast.success("Métricas salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar métricas");
    }
  }

  function getReportData(): ReportData {
    return {
      title: "Relatório Comercial e Marketing",
      subtitle: "Doctor Auto Prime",
      kpis: [
        { label: "Total de Clientes", value: kpis.totalClients },
        { label: "Novos Clientes (Mês)", value: kpis.newClients },
        { label: "Cliques em Promoções", value: kpis.promoClicks },
        { label: "Promoções Ativas", value: kpis.activePromos },
        { label: "Taxa de Conversão", value: `${kpis.conversionRate}%` },
        { label: "Ticket Médio", value: `R$ ${kpis.averageTicket.toLocaleString("pt-BR")}` },
        { label: "Faturamento Mensal", value: `R$ ${kpis.monthlyRevenue.toLocaleString("pt-BR")}` },
        { label: "Leads do Mês", value: kpis.leadCount },
      ],
      tables: [
        {
          title: "Performance das Promoções",
          headers: ["Promoção", "Cliques"],
          rows: promoStats.map(p => [p.title, p.clicks]),
        },
      ],
    };
  }

  const statCards = [
    { key: "totalClients", label: "Total de Clientes", icon: Users, color: "text-blue-500", prefix: "" },
    { key: "newClients", label: "Novos Clientes (Mês)", icon: TrendingUp, color: "text-green-500", prefix: "" },
    { key: "promoClicks", label: "Cliques em Promoções", icon: Eye, color: "text-purple-500", prefix: "" },
    { key: "activePromos", label: "Promoções Ativas", icon: Target, color: "text-orange-500", prefix: "" },
    { key: "conversionRate", label: "Taxa de Conversão (%)", icon: TrendingUp, color: "text-cyan-500", prefix: "", suffix: "%" },
    { key: "averageTicket", label: "Ticket Médio", icon: Target, color: "text-amber-500", prefix: "R$ " },
    { key: "monthlyRevenue", label: "Faturamento Mensal", icon: TrendingUp, color: "text-emerald-500", prefix: "R$ " },
    { key: "leadCount", label: "Leads do Mês", icon: Users, color: "text-pink-500", prefix: "" },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <CustomizableDashboard dashboardKey="comercial" title="Comercial e Marketing">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-orange-500" />
                Comercial e Marketing
              </h1>
              <p className="text-muted-foreground mt-1">
                Métricas de aquisição e campanhas
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => {
                    setEditedKpis(kpis);
                    setIsEditing(false);
                  }}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={saveKpis}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar Métricas
                  </Button>
                  <ExportButtons
                    onExportPDF={() => exportToPDF(getReportData())}
                    onExportExcel={() => exportToExcel(getReportData())}
                    isLoading={isLoading}
                  />
                </>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                  <Card key={stat.key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedKpis[stat.key as keyof EditableKpis]}
                          onChange={(e) => setEditedKpis(prev => ({
                            ...prev,
                            [stat.key]: Number(e.target.value) || 0
                          }))}
                          className="text-2xl font-bold h-12"
                        />
                      ) : (
                        <p className="text-3xl font-bold">
                          {stat.prefix}{kpis[stat.key as keyof EditableKpis].toLocaleString("pt-BR")}{stat.suffix || ""}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Novos Clientes (Últimos 7 dias)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyClients.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dailyClients}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--popover))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }} 
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Novos Clientes" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Sem novos clientes nos últimos 7 dias
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Promoções Ativas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {promoStats.length > 0 ? (
                      <div className="space-y-3">
                        {promoStats.map((promo) => (
                          <div
                            key={promo.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <p className="font-medium truncate flex-1 mr-4">{promo.title}</p>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{promo.clicks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhuma promoção ativa
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CustomizableDashboard>
      </div>
    </AdminLayout>
  );
}
