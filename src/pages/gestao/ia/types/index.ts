/**
 * Tipos e Interfaces - Gestão de IAs
 */

export type TipoIA = "pura" | "hibrida" | "auto";
export type ModeloIA = "gpt-4" | "gpt-3.5" | "claude-3" | "gemini" | null;
export type StatusIA = "online" | "offline" | "standby" | "erro";
export type PrioridadeIA = "maxima" | "alta" | "media" | "baixa";

export interface GastosIA {
  hoje: number;
  semana: number;
  mes: number;
  total: number;
}

export interface UsoIA {
  tokens: number;
  tokensInput: number;
  tokensOutput: number;
  requests: number;
  mediaTokens: number;
}

export interface ConfigIA {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface LogIA {
  acao: string;
  timestamp: string;
  tipo: "info" | "warning" | "error" | "success";
  detalhes?: string;
}

export interface IA {
  // Identificação
  id: string;
  nome: string;
  funcao: string;
  descricao: string;
  emoji: string;
  icon: any;
  
  // Status
  ativa: boolean;
  status: StatusIA;
  ultimaAcao: string;
  prioridade: PrioridadeIA;
  
  // Tipo e Modelo
  tipo: TipoIA;
  modelo: ModeloIA;
  
  // Gastos e Uso
  gastos: GastosIA;
  uso: UsoIA;
  
  // Configuração
  config?: ConfigIA;
  
  // Performance
  performance: number; // 0-100
  disponibilidade: number; // 0-100 (uptime)
  
  // Logs
  logs?: LogIA[];
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
}

export interface PrecoModelo {
  input: number;   // Preço por 1K tokens de input
  output: number;  // Preço por 1K tokens de output
}

export interface PrecosModelos {
  [key: string]: PrecoModelo;
}

export interface EstatisticasGerais {
  totalIAs: number;
  ativasCount: number;
  inativasCount: number;
  gastosTotal: GastosIA;
  usototal: UsoIA;
  performanceMedia: number;
  disponibilidadeMedia: number;
  topGastadoras: Array<{
    id: string;
    nome: string;
    gasto: number;
  }>;
}
