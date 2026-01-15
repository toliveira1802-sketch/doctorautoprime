import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PatioStatus = 
  | "fora_da_loja"
  | "diagnostico"
  | "orcamento"
  | "aguardando_aprovacao"
  | "bo_peca"
  | "aguardando_pecas"
  | "em_execucao"
  | "em_teste"
  | "pronto_retirada"
  | "concluido";

export interface PatioItem {
  id: string;
  trelloCardId: string;
  client: string;
  vehicle: string;
  plate: string;
  service: string;
  status: PatioStatus;
  entryDate: string;
  trelloUrl: string;
}

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  url: string;
  dateLastActivity: string;
  due: string | null;
  labels: { id: string; name: string; color: string }[];
}

interface TrelloList {
  id: string;
  name: string;
  pos: number;
}

// Mapeamento das listas do Trello para status do pátio
const listNameToStatus: Record<string, PatioStatus> = {
  "fora da loja": "fora_da_loja",
  "diagnostico": "diagnostico",
  "em orçamento": "orcamento",
  "aguardando aprovar": "aguardando_aprovacao",
  "b.o peça/ b.o oficina": "bo_peca",
  "aguardando peça": "aguardando_pecas",
  "em serviço": "em_execucao",
  "em teste": "em_teste",
  "pronto": "pronto_retirada",
  "veiculo entregue": "concluido",
};

// ID do board "Fluxo oficina - Doctor Bosch"
const BOARD_ID = "688cdaa40319999113a5e73b";

// Função para extrair placa, veículo e cliente do nome do card
// Formato típico: "PLACA VEICULO CLIENTE" ou "PLACA VEICULO"
function parseCardName(name: string): { plate: string; vehicle: string; client: string } {
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) {
    return { plate: "", vehicle: "", client: "" };
  }

  // Primeira parte geralmente é a placa
  const plate = parts[0] || "";
  
  // Se só tem uma parte, é só a placa
  if (parts.length === 1) {
    return { plate, vehicle: "", client: "" };
  }

  // Se tem duas partes, segunda é o veículo
  if (parts.length === 2) {
    return { plate, vehicle: parts[1], client: "" };
  }

  // Se tem mais partes, segunda é veículo e o resto é cliente
  const vehicle = parts[1];
  const client = parts.slice(2).join(" ");
  
  return { plate, vehicle, client };
}

// Formatar data
function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

export function useTrelloCards() {
  const [items, setItems] = useState<PatioItem[]>([]);
  const [lists, setLists] = useState<TrelloList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar listas e cards em paralelo
      const [listsResponse, cardsResponse] = await Promise.all([
        supabase.functions.invoke("trello-boards", {
          body: { action: "getLists", boardId: BOARD_ID },
        }),
        supabase.functions.invoke("trello-boards", {
          body: { action: "getBoardCards", boardId: BOARD_ID },
        }),
      ]);

      if (listsResponse.error) throw new Error(listsResponse.error.message);
      if (cardsResponse.error) throw new Error(cardsResponse.error.message);

      const trelloLists: TrelloList[] = listsResponse.data;
      const trelloCards: TrelloCard[] = cardsResponse.data;

      setLists(trelloLists);

      // Criar mapa de listId para status
      const listIdToStatus: Record<string, PatioStatus> = {};
      trelloLists.forEach((list) => {
        const normalizedName = list.name.toLowerCase().trim();
        const status = listNameToStatus[normalizedName];
        if (status) {
          listIdToStatus[list.id] = status;
        }
      });

      // Converter cards do Trello para PatioItems
      const patioItems: PatioItem[] = trelloCards
        .map((card) => {
          const status = listIdToStatus[card.idList];
          if (!status) return null;

          const { plate, vehicle, client } = parseCardName(card.name);

          return {
            id: card.id,
            trelloCardId: card.id,
            client: client || "Sem cliente",
            vehicle: vehicle || "Veículo",
            plate: plate,
            service: card.desc || "Sem descrição",
            status,
            entryDate: formatDate(card.dateLastActivity),
            trelloUrl: card.url,
          };
        })
        .filter((item): item is PatioItem => item !== null);

      setItems(patioItems);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados do Trello";
      setError(message);
      console.error("Erro ao buscar dados do Trello:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    lists,
    isLoading,
    error,
    refresh: fetchData,
  };
}
