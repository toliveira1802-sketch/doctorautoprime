import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChecklistItem {
  key: string;
  label: string;
  checked: boolean;
}

interface AnalysisRequest {
  veiculo: string;
  kmAtual: string;
  checklistEntrada: Record<string, boolean>;
  checklistDinamometro?: Record<string, boolean>;
  checklistPreCompra?: Record<string, boolean>;
  descricaoProblema?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin access
    const { data: hasAccess } = await supabaseClient.rpc('has_admin_access');
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { veiculo, kmAtual, checklistEntrada, checklistDinamometro, checklistPreCompra, descricaoProblema }: AnalysisRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map checklist keys to labels for better AI understanding
    const checklistLabels: Record<string, string> = {
      // Entrada - Obrigatórios
      nivelOleo: "Nível de Óleo",
      nivelAgua: "Nível de Água",
      freios: "Freios",
      kmAtual: "KM Atual Registrado",
      // Entrada - Opcionais
      pneus: "Pneus",
      luzes: "Luzes",
      bateria: "Bateria",
      correia: "Correia",
      suspensao: "Suspensão",
      limpadores: "Limpadores",
      arCondicionado: "Ar Condicionado",
      vidros: "Vidros",
      // Dinamômetro
      potencia: "Potência",
      torque: "Torque",
      boost: "Boost (PSI)",
      afr: "Relação Ar/Combustível (AFR)",
      temperaturaEscape: "Temperatura Escape",
      temperaturaIntercooler: "Temperatura Intercooler",
      pressaoOleo: "Pressão de Óleo",
      // Pré-Compra
      motor: "Motor",
      transmissao: "Transmissão",
      direcao: "Direção",
      arRefrigeracao: "Ar/Refrigeração",
      eletrica: "Elétrica",
      estrutura: "Estrutura/Carroceria",
      documentacao: "Documentação",
      historico: "Histórico de Manutenção",
    };

    // Format checklists for AI
    const formatChecklist = (checklist: Record<string, boolean> | undefined, name: string): string => {
      if (!checklist || Object.keys(checklist).length === 0) return "";
      
      const items = Object.entries(checklist).map(([key, checked]) => {
        const label = checklistLabels[key] || key;
        return `- ${label}: ${checked ? "✓ OK" : "✗ NÃO VERIFICADO/PROBLEMA"}`;
      });
      
      return `\n${name}:\n${items.join("\n")}`;
    };

    const checklistFormatado = [
      formatChecklist(checklistEntrada, "Checklist de Entrada"),
      formatChecklist(checklistDinamometro, "Checklist Dinamômetro"),
      formatChecklist(checklistPreCompra, "Checklist Pré-Compra"),
    ].filter(Boolean).join("\n");

    // Count issues
    const countIssues = (checklist: Record<string, boolean> | undefined): number => {
      if (!checklist) return 0;
      return Object.values(checklist).filter(v => !v).length;
    };

    const totalIssues = countIssues(checklistEntrada) + countIssues(checklistDinamometro) + countIssues(checklistPreCompra);

    const systemPrompt = `Você é um consultor técnico automotivo especializado em diagnóstico de veículos. 
Analise o checklist de entrada do veículo e identifique potenciais problemas, riscos e serviços necessários.

IMPORTANTE:
- Seja preciso e objetivo
- Priorize itens de segurança
- Considere o contexto do veículo (modelo, km)
- Sugira apenas serviços realmente necessários baseados nos dados
- Use linguagem técnica mas acessível

Retorne um JSON válido com a seguinte estrutura:
{
  "resumo": "Resumo executivo da análise em 1-2 frases",
  "nivelRisco": "baixo" | "medio" | "alto" | "critico",
  "problemasIdentificados": [
    {
      "item": "Nome do item do checklist",
      "descricao": "Descrição detalhada do problema potencial",
      "risco": "baixo" | "medio" | "alto" | "critico",
      "urgencia": "imediata" | "proxima_revisao" | "monitorar",
      "servicoSugerido": "Serviço ou ação recomendada",
      "valorEstimado": número em reais (0 se não aplicável)
    }
  ],
  "alertasSeguranca": ["Lista de alertas críticos de segurança se houver"],
  "recomendacoesGerais": ["Recomendações gerais de manutenção preventiva"],
  "proximosServicos": ["Serviços que devem ser agendados em breve"]
}`;

    const userPrompt = `Analise o seguinte veículo e seu checklist de entrada:

VEÍCULO: ${veiculo}
KM ATUAL: ${kmAtual || "Não informado"}
${descricaoProblema ? `PROBLEMA RELATADO PELO CLIENTE: ${descricaoProblema}` : ""}

CHECKLIST:
${checklistFormatado}

${totalIssues > 0 ? `⚠️ ${totalIssues} item(s) não verificado(s) ou com problema identificado.` : "✓ Todos os itens verificados estão OK."}

Com base nessas informações, faça uma análise técnica completa identificando:
1. Problemas potenciais baseados nos itens não verificados ou com problema
2. Riscos de segurança
3. Serviços necessários com estimativa de valores
4. Recomendações preventivas considerando o km do veículo`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao comunicar com AI");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da AI");
    }

    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      // Return a basic structure if parsing fails
      analysis = {
        resumo: "Análise não pôde ser processada completamente. Revise manualmente.",
        nivelRisco: totalIssues > 3 ? "alto" : totalIssues > 0 ? "medio" : "baixo",
        problemasIdentificados: [],
        alertasSeguranca: [],
        recomendacoesGerais: ["Realizar verificação manual completa"],
        proximosServicos: [],
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-checklist-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
