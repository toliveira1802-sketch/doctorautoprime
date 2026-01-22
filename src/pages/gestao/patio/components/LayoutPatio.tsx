/**
 * Layout Interativo do Pátio da Oficina
 * Baseado no esboço: oficina_sketch_final_v10.png
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Car,
  Wrench,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from "lucide-react";

// Tipos
export type StatusArea = "livre" | "ocupado" | "manutencao" | "reservado";

export interface Veiculo {
  placa: string;
  modelo: string;
  cliente: string;
  servico: string;
  entrada: string;
  previsaoSaida: string;
}

export interface Area {
  id: string;
  nome: string;
  tipo: "elevador" | "box" | "area";
  status: StatusArea;
  veiculo?: Veiculo;
  x: number;  // Posição X (metros)
  y: number;  // Posição Y (metros)
  width: number;
  height: number;
}

interface LayoutPatioProps {
  areas: Area[];
  onAreaClick?: (area: Area) => void;
  showGrid?: boolean;
}

export function LayoutPatio({ areas, onAreaClick, showGrid = true }: LayoutPatioProps) {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  
  // Dimensões do pátio (em metros)
  const PATIO_WIDTH = 22;
  const PATIO_HEIGHT = 40;
  
  // Escala para renderização (pixels por metro)
  const SCALE = 15;
  
  const handleAreaClick = (area: Area) => {
    setSelectedArea(area);
    onAreaClick?.(area);
  };
  
  const getStatusColor = (status: StatusArea) => {
    switch (status) {
      case "livre": return "bg-accent/20 border-accent hover:bg-accent/30";
      case "ocupado": return "bg-destructive/20 border-destructive hover:bg-destructive/30";
      case "manutencao": return "bg-primary/20 border-primary hover:bg-primary/30";
      case "reservado": return "bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30";
      default: return "bg-muted border-border";
    }
  };
  
  const getStatusIcon = (status: StatusArea) => {
    switch (status) {
      case "livre": return <CheckCircle2 className="w-3 h-3 text-accent" />;
      case "ocupado": return <Car className="w-3 h-3 text-destructive" />;
      case "manutencao": return <Wrench className="w-3 h-3 text-primary" />;
      case "reservado": return <Clock className="w-3 h-3 text-yellow-500" />;
    }
  };
  
  const getStatusText = (status: StatusArea) => {
    switch (status) {
      case "livre": return "Livre";
      case "ocupado": return "Ocupado";
      case "manutencao": return "Manutenção";
      case "reservado": return "Reservado";
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Legenda */}
      <Card className="bg-card border-border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-mono text-muted-foreground">LEGENDA:</span>
          
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono">Livre</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-destructive" />
            <span className="text-xs font-mono">Ocupado</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono">Manutenção</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-mono">Reservado</span>
          </div>
        </div>
      </Card>
      
      {/* Layout do Pátio */}
      <Card className="bg-card border-border p-6 overflow-auto">
        <div className="relative" style={{
          width: PATIO_WIDTH * SCALE,
          height: PATIO_HEIGHT * SCALE,
          minWidth: 600,
          minHeight: 800
        }}>
          {/* Grid de fundo */}
          {showGrid && (
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
                    <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}
          
          {/* Borda do pátio */}
          <div className="absolute inset-0 border-2 border-dashed border-border" />
          
          {/* Áreas */}
          {areas.map((area) => (
            <div
              key={area.id}
              className={`absolute border-2 cursor-pointer transition-all ${getStatusColor(area.status)} ${
                selectedArea?.id === area.id ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{
                left: area.x * SCALE,
                top: area.y * SCALE,
                width: area.width * SCALE,
                height: area.height * SCALE
              }}
              onClick={() => handleAreaClick(area)}
            >
              <div className="p-2 h-full flex flex-col justify-between">
                {/* Nome e Status */}
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-mono font-bold text-foreground truncate">
                    {area.nome}
                  </span>
                  {getStatusIcon(area.status)}
                </div>
                
                {/* Veículo (se houver) */}
                {area.veiculo && (
                  <div className="text-xs font-mono text-muted-foreground">
                    <div className="truncate">{area.veiculo.placa}</div>
                    <div className="truncate text-[10px]">{area.veiculo.modelo}</div>
                  </div>
                )}
                
                {/* Badge de Status */}
                <Badge className={`text-[10px] ${
                  area.status === "livre" ? "bg-accent/30 text-accent" :
                  area.status === "ocupado" ? "bg-destructive/30 text-destructive" :
                  area.status === "manutencao" ? "bg-primary/30 text-primary" :
                  "bg-yellow-500/30 text-yellow-500"
                }`}>
                  {getStatusText(area.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Detalhes da Área Selecionada */}
      {selectedArea && (
        <Card className="bg-card border-primary p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">
                {selectedArea.nome}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {selectedArea.tipo.toUpperCase()} • {getStatusText(selectedArea.status)}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArea(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {selectedArea.veiculo ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">PLACA</span>
                  <p className="text-sm font-bold text-foreground">{selectedArea.veiculo.placa}</p>
                </div>
                
                <div>
                  <span className="text-xs font-mono text-muted-foreground">MODELO</span>
                  <p className="text-sm font-bold text-foreground">{selectedArea.veiculo.modelo}</p>
                </div>
                
                <div>
                  <span className="text-xs font-mono text-muted-foreground">CLIENTE</span>
                  <p className="text-sm font-bold text-foreground">{selectedArea.veiculo.cliente}</p>
                </div>
                
                <div>
                  <span className="text-xs font-mono text-muted-foreground">SERVIÇO</span>
                  <p className="text-sm font-bold text-foreground">{selectedArea.veiculo.servico}</p>
                </div>
                
                <div>
                  <span className="text-xs font-mono text-muted-foreground">ENTRADA</span>
                  <p className="text-sm font-bold text-foreground">{selectedArea.veiculo.entrada}</p>
                </div>
                
                <div>
                  <span className="text-xs font-mono text-muted-foreground">PREVISÃO SAÍDA</span>
                  <p className="text-sm font-bold text-foreground">{selectedArea.veiculo.previsaoSaida}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1">
                  📋 Ver OS
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  ✅ Finalizar
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-destructive text-destructive">
                  🚗 Mover
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-mono">
                Área disponível
              </p>
              <Button size="sm" className="mt-3">
                ➕ Alocar Veículo
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
