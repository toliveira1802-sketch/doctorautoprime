/**
 * Componente de Rastreamento de Custos
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Zap,
  Activity,
  AlertTriangle
} from "lucide-react";
import { formatarMoeda, formatarTokens, calcularTendencia } from "../hooks/useIACost";
import type { GastosIA, UsoIA } from "../types";

interface CostTrackerProps {
  gastos: GastosIA;
  uso: UsoIA;
  gastosAnteriores?: {
    hoje: number;
    semana: number;
    mes: number;
  };
}

export function CostTracker({ gastos, uso, gastosAnteriores }: CostTrackerProps) {
  const tendenciaHoje = gastosAnteriores 
    ? calcularTendencia(gastos.hoje, gastosAnteriores.hoje)
    : null;
  
  const tendenciaSemana = gastosAnteriores 
    ? calcularTendencia(gastos.semana, gastosAnteriores.semana)
    : null;
  
  const custoMedioPorRequest = uso.requests > 0 
    ? gastos.mes / uso.requests 
    : 0;
  
  const custoMedioPor1KTokens = uso.tokens > 0 
    ? (gastos.mes / uso.tokens) * 1000 
    : 0;
  
  const getTendenciaIcon = (direcao?: "up" | "down" | "stable") => {
    switch (direcao) {
      case "up": return <TrendingUp className="w-4 h-4 text-destructive" />;
      case "down": return <TrendingDown className="w-4 h-4 text-accent" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  const getTendenciaColor = (direcao?: "up" | "down" | "stable") => {
    switch (direcao) {
      case "up": return "text-destructive";
      case "down": return "text-accent";
      default: return "text-muted-foreground";
    }
  };
  
  // Alerta de gasto alto
  const gastoAlto = gastos.hoje > 50; // R$ 50/dia
  
  return (
    <div className="space-y-4">
      {/* Alerta de Gasto Alto */}
      {gastoAlto && (
        <Card className="bg-destructive/10 border-destructive p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <h4 className="font-display font-bold text-sm text-destructive">
                Gasto Alto Detectado!
              </h4>
              <p className="text-xs text-muted-foreground">
                Gastos hoje: {formatarMoeda(gastos.hoje)} - Considere revisar o uso das IAs
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Cards de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hoje */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">HOJE</span>
            </div>
            {tendenciaHoje && (
              <div className="flex items-center gap-1">
                {getTendenciaIcon(tendenciaHoje.direcao)}
                <span className={`text-xs font-mono ${getTendenciaColor(tendenciaHoje.direcao)}`}>
                  {tendenciaHoje.percentual.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {formatarMoeda(gastos.hoje)}
          </div>
        </Card>
        
        {/* Semana */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">SEMANA</span>
            </div>
            {tendenciaSemana && (
              <div className="flex items-center gap-1">
                {getTendenciaIcon(tendenciaSemana.direcao)}
                <span className={`text-xs font-mono ${getTendenciaColor(tendenciaSemana.direcao)}`}>
                  {tendenciaSemana.percentual.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {formatarMoeda(gastos.semana)}
          </div>
        </Card>
        
        {/* Mês */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">MÊS</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {formatarMoeda(gastos.mes)}
          </div>
        </Card>
        
        {/* Total */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="text-xs font-mono text-muted-foreground">TOTAL</span>
          </div>
          <div className="text-2xl font-display font-bold text-accent">
            {formatarMoeda(gastos.total)}
          </div>
        </Card>
      </div>
      
      {/* Cards de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tokens */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">TOKENS</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {formatarTokens(uso.tokens)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatarTokens(uso.tokensInput)} in / {formatarTokens(uso.tokensOutput)} out
          </div>
        </Card>
        
        {/* Requests */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">REQUESTS</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {uso.requests.toLocaleString('pt-BR')}
          </div>
        </Card>
        
        {/* Custo Médio por Request */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">CUSTO/REQ</span>
          </div>
          <div className="text-2xl font-display font-bold text-muted-foreground">
            {formatarMoeda(custoMedioPorRequest)}
          </div>
        </Card>
        
        {/* Custo Médio por 1K Tokens */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">CUSTO/1K</span>
          </div>
          <div className="text-2xl font-display font-bold text-muted-foreground">
            {formatarMoeda(custoMedioPor1KTokens)}
          </div>
        </Card>
      </div>
    </div>
  );
}
