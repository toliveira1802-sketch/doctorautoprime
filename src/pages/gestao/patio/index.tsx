/**
 * Monitoramento de Pátio - Página Principal
 * Layout baseado em: oficina_sketch_final_v10.png
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download
} from "lucide-react";
import { LayoutPatio, type Area, type StatusArea } from "./components/LayoutPatio";
import { Link } from "wouter";

export default function MonitoramentoPatio() {
  // Estado das áreas (baseado no layout real da oficina)
  const [areas, setAreas] = useState<Area[]>([
    // Elevadores (coluna esquerda)
    { id: "elev-7", nome: "Elevador 7", tipo: "elevador", status: "livre", x: 0, y: 33, width: 3, height: 2 },
    { id: "elev-6", nome: "Elevador 6", tipo: "elevador", status: "ocupado", x: 0, y: 30, width: 3, height: 2,
      veiculo: { placa: "ABC-1234", modelo: "Gol 2020", cliente: "João Silva", servico: "Troca de óleo", entrada: "08:30", previsaoSaida: "10:00" }
    },
    { id: "elev-5", nome: "Elevador 5", tipo: "elevador", status: "ocupado", x: 0, y: 27, width: 3, height: 2,
      veiculo: { placa: "XYZ-5678", modelo: "Civic 2019", cliente: "Maria Santos", servico: "Revisão completa", entrada: "09:15", previsaoSaida: "16:00" }
    },
    { id: "elev-4", nome: "Elevador 4", tipo: "elevador", status: "livre", x: 0, y: 24, width: 3, height: 2 },
    { id: "elev-3", nome: "Elevador 3", tipo: "elevador", status: "manutencao", x: 0, y: 21, width: 3, height: 2 },
    { id: "elev-2", nome: "Elevador 2", tipo: "elevador", status: "livre", x: 0, y: 18, width: 3, height: 2 },
    { id: "elev-1", nome: "Elevador 1", tipo: "elevador", status: "livre", x: 0, y: 15, width: 3, height: 2 },
    { id: "box-ar", nome: "Box Ar-cond.", tipo: "box", status: "livre", x: 0, y: 10, width: 3, height: 4 },
    
    // Boxes (centro superior)
    { id: "box-d", nome: "Box D", tipo: "box", status: "livre", x: 5, y: 33, width: 4, height: 3 },
    { id: "box-e", nome: "Box E", tipo: "box", status: "livre", x: 10, y: 33, width: 4, height: 3 },
    
    // Elevadores (direita superior)
    { id: "elev-8", nome: "Elevador 8", tipo: "elevador", status: "ocupado", x: 15, y: 33, width: 5, height: 3,
      veiculo: { placa: "DEF-9012", modelo: "Corolla 2021", cliente: "Pedro Costa", servico: "Alinhamento", entrada: "10:00", previsaoSaida: "11:30" }
    },
    
    // Elevador Diagnóstico
    { id: "elev-diag", nome: "Elevador Diagnóstico", tipo: "elevador", status: "livre", x: 15, y: 24, width: 5, height: 4 },
    
    // REMAP e VCDS
    { id: "remap", nome: "REMAP e VCDS", tipo: "area", status: "reservado", x: 11, y: 10, width: 4, height: 7 },
    
    // Dinamômetro
    { id: "dinamometro", nome: "DINAMÔMETRO", tipo: "area", status: "livre", x: 15, y: 10, width: 5, height: 7 },
    
    // Rampa de Alinhamento
    { id: "rampa", nome: "RAMPA DE ALINHAMENTO", tipo: "area", status: "ocupado", x: 15, y: 0, width: 5, height: 9,
      veiculo: { placa: "GHI-3456", modelo: "HB20 2022", cliente: "Ana Lima", servico: "Alinhamento 3D", entrada: "07:00", previsaoSaida: "08:00" }
    },
    
    // Loja/Sala
    { id: "loja", nome: "LOJA / SALA", tipo: "area", status: "livre", x: 0, y: 0, width: 10, height: 9 }
  ]);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Aqui você faria fetch da API real
      console.log("Atualizando dados do pátio...");
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Estatísticas
  const stats = {
    total: areas.length,
    livres: areas.filter(a => a.status === "livre").length,
    ocupados: areas.filter(a => a.status === "ocupado").length,
    manutencao: areas.filter(a => a.status === "manutencao").length,
    reservados: areas.filter(a => a.status === "reservado").length,
    taxaOcupacao: ((areas.filter(a => a.status === "ocupado").length / areas.length) * 100).toFixed(1)
  };
  
  const handleAreaClick = (area: Area) => {
    console.log("Área clicada:", area);
  };
  
  const handleRefresh = () => {
    // Aqui você faria fetch da API
    console.log("Atualizando manualmente...");
  };
  
  const handleExport = () => {
    // Exporta relatório
    const data = areas.map(a => ({
      area: a.nome,
      status: a.status,
      veiculo: a.veiculo?.placa || "-",
      cliente: a.veiculo?.cliente || "-"
    }));
    
    console.log("Exportando:", data);
    // Implementar export CSV/PDF
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary/30">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <Badge variant="outline" className="border-primary text-primary font-mono text-xs">
                  MONITORAMENTO ATIVO
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-foreground mb-2">
                🏗️ MONITORAMENTO DE PÁTIO
              </h1>
              <p className="text-sm font-mono text-muted-foreground">
                Layout da Oficina // Versão Final v10
              </p>
            </div>
            
            <Link href="/">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                ← Voltar ao Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-card border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">TOTAL</span>
              </div>
              <div className="text-xl font-display font-bold text-foreground">{stats.total}</div>
            </Card>
            
            <Card className="bg-card border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono text-muted-foreground">LIVRES</span>
              </div>
              <div className="text-xl font-display font-bold text-accent">{stats.livres}</div>
            </Card>
            
            <Card className="bg-card border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-destructive" />
                <span className="text-xs font-mono text-muted-foreground">OCUPADOS</span>
              </div>
              <div className="text-xl font-display font-bold text-destructive">{stats.ocupados}</div>
            </Card>
            
            <Card className="bg-card border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">MANUTENÇÃO</span>
              </div>
              <div className="text-xl font-display font-bold text-primary">{stats.manutencao}</div>
            </Card>
            
            <Card className="bg-card border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-mono text-muted-foreground">RESERVADOS</span>
              </div>
              <div className="text-xl font-display font-bold text-yellow-500">{stats.reservados}</div>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        {/* Controles */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="border-primary text-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <label className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">Taxa de Ocupação:</span>
            <Badge className={`${
              parseFloat(stats.taxaOcupacao) > 80 ? "bg-destructive/20 text-destructive" :
              parseFloat(stats.taxaOcupacao) > 50 ? "bg-primary/20 text-primary" :
              "bg-accent/20 text-accent"
            }`}>
              {stats.taxaOcupacao}%
            </Badge>
          </div>
        </div>
        
        {/* Layout Interativo */}
        <LayoutPatio
          areas={areas}
          onAreaClick={handleAreaClick}
          showGrid={true}
        />
        
        {/* Veículos em Atendimento */}
        <Card className="mt-8 bg-card border-border p-6">
          <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            VEÍCULOS EM ATENDIMENTO
          </h2>
          
          <div className="space-y-3">
            {areas.filter(a => a.veiculo).map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center border-2 ${
                    area.status === "ocupado" ? "bg-destructive/20 border-destructive" : "bg-primary/20 border-primary"
                  }`}>
                    <Car className={`w-6 h-6 ${
                      area.status === "ocupado" ? "text-destructive" : "text-primary"
                    }`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-foreground">{area.veiculo?.placa}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{area.veiculo?.modelo}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span>📍 {area.nome}</span>
                      <span>👤 {area.veiculo?.cliente}</span>
                      <span>🔧 {area.veiculo?.servico}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono text-muted-foreground">Entrada</div>
                    <div className="text-sm font-bold text-foreground">{area.veiculo?.entrada}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-muted-foreground">Previsão</div>
                    <div className="text-sm font-bold text-primary">{area.veiculo?.previsaoSaida}</div>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
