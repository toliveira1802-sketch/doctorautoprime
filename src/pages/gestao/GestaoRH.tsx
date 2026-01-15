import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExportButtons } from "@/components/gestao/ExportButtons";
import { AddDirectoryDialog } from "@/components/gestao/AddDirectoryDialog";
import { exportToPDF, exportToExcel, type ReportData } from "@/utils/exportReport";
import { UserCog, Users, Clock, Award, TrendingUp, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Mechanic {
  id: string;
  name: string;
  specialty: string | null;
  is_active: boolean;
}

interface FeedbackStats {
  mechanic_id: string;
  avg_performance: number;
  avg_quality: number;
  avg_punctuality: number;
  total_feedbacks: number;
}

export default function GestaoRH() {
  const [isLoading, setIsLoading] = useState(true);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [kpis, setKpis] = useState({
    totalMechanics: 0,
    activeMechanics: 0,
    avgPerformance: 0,
    avgQuality: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Buscar mecânicos
      const { data: mechanicsData } = await supabase
        .from("mechanics")
        .select("*")
        .order("name");

      // Buscar feedbacks agregados
      const { data: feedbackData } = await supabase
        .from("mechanic_daily_feedback")
        .select("mechanic_id, performance_score, quality_score, punctuality_score");

      if (mechanicsData) {
        setMechanics(mechanicsData);
        const active = mechanicsData.filter(m => m.is_active).length;
        
        // Calcular médias de feedback
        const statsMap: Record<string, { perf: number[]; qual: number[]; punct: number[] }> = {};
        feedbackData?.forEach(f => {
          if (!f.mechanic_id) return;
          if (!statsMap[f.mechanic_id]) {
            statsMap[f.mechanic_id] = { perf: [], qual: [], punct: [] };
          }
          if (f.performance_score) statsMap[f.mechanic_id].perf.push(f.performance_score);
          if (f.quality_score) statsMap[f.mechanic_id].qual.push(f.quality_score);
          if (f.punctuality_score) statsMap[f.mechanic_id].punct.push(f.punctuality_score);
        });

        const allPerf = feedbackData?.map(f => f.performance_score).filter(Boolean) || [];
        const allQual = feedbackData?.map(f => f.quality_score).filter(Boolean) || [];
        const avgPerf = allPerf.length > 0 ? allPerf.reduce((a, b) => a + b, 0) / allPerf.length : 0;
        const avgQual = allQual.length > 0 ? allQual.reduce((a, b) => a + b, 0) / allQual.length : 0;

        setKpis({
          totalMechanics: mechanicsData.length,
          activeMechanics: active,
          avgPerformance: Math.round(avgPerf * 10) / 10,
          avgQuality: Math.round(avgQual * 10) / 10,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }

  function getReportData(): ReportData {
    return {
      title: "Relatório de Recursos Humanos",
      subtitle: "Doctor Auto Prime",
      kpis: [
        { label: "Total de Mecânicos", value: kpis.totalMechanics },
        { label: "Mecânicos Ativos", value: kpis.activeMechanics },
        { label: "Performance Média", value: `${kpis.avgPerformance}/5` },
        { label: "Qualidade Média", value: `${kpis.avgQuality}/5` },
      ],
      tables: [
        {
          title: "Lista de Mecânicos",
          headers: ["Nome", "Especialidade", "Status"],
          rows: mechanics.map(m => [
            m.name,
            m.specialty || "Geral",
            m.is_active ? "Ativo" : "Inativo",
          ]),
        },
      ],
    };
  }

  const stats = [
    { label: "Total Mecânicos", value: kpis.totalMechanics, icon: Users, color: "text-blue-500" },
    { label: "Mecânicos Ativos", value: kpis.activeMechanics, icon: UserCog, color: "text-green-500" },
    { label: "Performance Média", value: `${kpis.avgPerformance}/5`, icon: TrendingUp, color: "text-purple-500" },
    { label: "Qualidade Média", value: `${kpis.avgQuality}/5`, icon: Award, color: "text-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="w-6 h-6 text-blue-500" />
              Recursos Humanos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão de pessoas e indicadores de RH
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddDirectoryDialog>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Diretório
              </Button>
            </AddDirectoryDialog>
            <ExportButtons
              onExportPDF={() => exportToPDF(getReportData())}
              onExportExcel={() => exportToExcel(getReportData())}
              isLoading={isLoading}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Equipe de Mecânicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mechanics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum mecânico cadastrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mechanics.map((mechanic) => (
                      <div
                        key={mechanic.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-medium">{mechanic.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {mechanic.specialty || "Especialidade: Geral"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            mechanic.is_active
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {mechanic.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
