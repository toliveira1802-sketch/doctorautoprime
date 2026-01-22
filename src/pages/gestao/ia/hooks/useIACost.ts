/**
 * Hook para cálculo de custos de IAs
 */

import { useMemo } from "react";
import type { IA, PrecoModelo, PrecosModelos } from "../types";

// Preços por modelo (valores em USD por 1K tokens)
// Atualizado em Janeiro 2026
export const PRECOS_MODELOS: PrecosModelos = {
  "gpt-4": {
    input: 0.03,
    output: 0.06
  },
  "gpt-3.5": {
    input: 0.0015,
    output: 0.002
  },
  "claude-3": {
    input: 0.015,
    output: 0.075
  },
  "gemini": {
    input: 0.00025,
    output: 0.0005
  }
};

// Taxa de conversão USD -> BRL (ajustar conforme necessário)
const TAXA_CONVERSAO = 5.5;

/**
 * Calcula o custo de uma requisição
 */
export function calcularCustoRequisicao(
  modelo: string,
  tokensInput: number,
  tokensOutput: number
): number {
  const preco = PRECOS_MODELOS[modelo];
  if (!preco) return 0;
  
  const custoUSD = (
    (tokensInput / 1000) * preco.input +
    (tokensOutput / 1000) * preco.output
  );
  
  return custoUSD * TAXA_CONVERSAO;
}

/**
 * Estima o custo mensal baseado no uso atual
 */
export function estimarCustoMensal(
  gastoDiario: number,
  diasNoMes: number = 30
): number {
  return gastoDiario * diasNoMes;
}

/**
 * Calcula economia ao usar automação vs IA
 */
export function calcularEconomia(
  ias: IA[]
): {
  totalAuto: number;
  totalIA: number;
  economia: number;
  percentual: number;
} {
  const iasAuto = ias.filter(ia => ia.tipo === "auto");
  const iasIA = ias.filter(ia => ia.tipo !== "auto");
  
  const totalAuto = iasAuto.length;
  const totalIA = iasIA.length;
  
  // Estima quanto custaria se todas fossem IA
  const gastoMedioIA = iasIA.reduce((acc, ia) => acc + ia.gastos.mes, 0) / (iasIA.length || 1);
  const economiaEstimada = gastoMedioIA * totalAuto;
  
  const totalGasto = iasIA.reduce((acc, ia) => acc + ia.gastos.mes, 0);
  const percentual = totalGasto > 0 ? (economiaEstimada / (totalGasto + economiaEstimada)) * 100 : 0;
  
  return {
    totalAuto,
    totalIA,
    economia: economiaEstimada,
    percentual
  };
}

/**
 * Hook principal para gerenciar custos
 */
export function useIACost(ias: IA[]) {
  const stats = useMemo(() => {
    const totalGastoHoje = ias.reduce((acc, ia) => acc + ia.gastos.hoje, 0);
    const totalGastoSemana = ias.reduce((acc, ia) => acc + ia.gastos.semana, 0);
    const totalGastoMes = ias.reduce((acc, ia) => acc + ia.gastos.mes, 0);
    const totalGastoTotal = ias.reduce((acc, ia) => acc + ia.gastos.total, 0);
    
    const totalTokens = ias.reduce((acc, ia) => acc + ia.uso.tokens, 0);
    const totalRequests = ias.reduce((acc, ia) => acc + ia.uso.requests, 0);
    
    const topGastadoras = [...ias]
      .sort((a, b) => b.gastos.mes - a.gastos.mes)
      .slice(0, 5)
      .map(ia => ({
        id: ia.id,
        nome: ia.nome,
        gasto: ia.gastos.mes,
        tipo: ia.tipo,
        modelo: ia.modelo
      }));
    
    const economia = calcularEconomia(ias);
    const estimativaMensal = estimarCustoMensal(totalGastoHoje);
    
    return {
      gastos: {
        hoje: totalGastoHoje,
        semana: totalGastoSemana,
        mes: totalGastoMes,
        total: totalGastoTotal
      },
      uso: {
        tokens: totalTokens,
        requests: totalRequests,
        mediaTokens: totalRequests > 0 ? totalTokens / totalRequests : 0
      },
      topGastadoras,
      economia,
      estimativaMensal
    };
  }, [ias]);
  
  return stats;
}

/**
 * Formata valor monetário
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata número de tokens
 */
export function formatarTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Calcula tendência de gasto
 */
export function calcularTendencia(
  gastoAtual: number,
  gastoAnterior: number
): {
  percentual: number;
  direcao: "up" | "down" | "stable";
} {
  if (gastoAnterior === 0) {
    return { percentual: 0, direcao: "stable" };
  }
  
  const percentual = ((gastoAtual - gastoAnterior) / gastoAnterior) * 100;
  
  let direcao: "up" | "down" | "stable" = "stable";
  if (percentual > 5) direcao = "up";
  else if (percentual < -5) direcao = "down";
  
  return { percentual: Math.abs(percentual), direcao };
}
