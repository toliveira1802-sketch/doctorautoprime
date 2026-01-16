import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnostico, problema, veiculo, itensAtuais } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um consultor de oficina mecânica especializado em orçamentos.
Analise o diagnóstico e problema do veículo e sugira serviços adicionais relevantes.

REGRAS:
- Sugira apenas serviços que façam sentido para o contexto
- Inclua preços realistas para o mercado brasileiro
- Priorize serviços preventivos e de segurança
- Máximo de 5 sugestões
- Considere o tipo de veículo

FORMATO DE RESPOSTA (JSON):
{
  "sugestoes": [
    {
      "descricao": "Nome do serviço",
      "justificativa": "Por que é recomendado (máx 50 palavras)",
      "prioridade": "vermelho|amarelo|verde",
      "valorEstimado": 150.00
    }
  ],
  "dicaVenda": "Uma dica curta para o vendedor fechar o serviço"
}`;

    const userPrompt = `
VEÍCULO: ${veiculo || "Não informado"}
PROBLEMA RELATADO: ${problema || "Não informado"}
DIAGNÓSTICO: ${diagnostico || "Não informado"}
ITENS JÁ NO ORÇAMENTO: ${itensAtuais?.map((i: any) => i.descricao).join(", ") || "Nenhum"}

Sugira serviços complementares relevantes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "sugerir_servicos",
              description: "Retorna sugestões de serviços para o orçamento",
              parameters: {
                type: "object",
                properties: {
                  sugestoes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        descricao: { type: "string" },
                        justificativa: { type: "string" },
                        prioridade: { type: "string", enum: ["vermelho", "amarelo", "verde"] },
                        valorEstimado: { type: "number" }
                      },
                      required: ["descricao", "justificativa", "prioridade", "valorEstimado"],
                      additionalProperties: false
                    }
                  },
                  dicaVenda: { type: "string" }
                },
                required: ["sugestoes", "dicaVenda"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "sugerir_servicos" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos AI esgotados. Contate o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar sugestões" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const suggestions = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to content if no tool call
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ sugestoes: [], dicaVenda: "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ sugestoes: [], dicaVenda: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
