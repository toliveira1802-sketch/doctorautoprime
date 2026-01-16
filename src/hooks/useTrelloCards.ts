import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PatioStatus = 
  | "diagnostico"
  | "orcamento"
  | "aguardando_aprovacao"
  | "aguardando_pecas"
  | "pronto_iniciar"
  | "em_execucao"
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
  osId?: string;
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
  "🧠diagnóstico": "diagnostico",
  "📝orçamento": "orcamento",
  "🤔aguardando aprovação": "aguardando_aprovacao",
  "😤aguardando peças": "aguardando_pecas",
  "🫵pronto para iniciar": "pronto_iniciar",
  "🛠️🔩em execução": "em_execucao",
  "💰pronto / aguardando retirada": "pronto_retirada",
  "🙏🏻entregue": "concluido",
};

// ID do board do Trello
const BOARD_ID = "NkhINjF2";

// Regex para detectar placa brasileira (3 letras + 4 números/letras)
const plateRegex = /\b([A-Z]{3}\d[A-Z0-9]\d{2}|[A-Z]{3}\d{4})\b/i;

// Função para extrair placa, veículo e cliente do nome do card
// Formatos possíveis: 
// "VEICULO PLACA" (ex: "FOCUS FGY1941")
// "VEICULO MODELO PLACA" (ex: "BMW 320 G20 PLACA RJF1J39")
// "VEICULO PLACA CLIENTE" (ex: "LIVINA VIDAL")
function parseCardName(name: string): { plate: string; vehicle: string; client: string } {
  const trimmedName = name.trim();
  
  // Tentar encontrar a placa no nome
  const plateMatch = trimmedName.match(plateRegex);
  
  if (plateMatch) {
    const plate = plateMatch[1].toUpperCase();
    const plateIndex = trimmedName.toUpperCase().indexOf(plate);
    
    // Tudo antes da placa é o veículo
    const beforePlate = trimmedName.substring(0, plateIndex).trim();
    // Tudo depois da placa é o cliente
    const afterPlate = trimmedName.substring(plateIndex + plate.length).trim();
    
    return {
      plate,
      vehicle: beforePlate || "Veículo",
      client: afterPlate || "",
    };
  }
  
  // Se não encontrou placa, usa o nome todo como veículo
  return {
    plate: "",
    vehicle: trimmedName,
    client: "",
  };
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

      // Extrair placas de todos os cards para buscar OS correspondentes
      const plates: string[] = [];
      trelloCards.forEach((card) => {
        const { plate } = parseCardName(card.name);
        if (plate) plates.push(plate.toUpperCase());
      });

      // Buscar ordens de serviço correspondentes às placas
      let osMap: Record<string, string> = {};
      if (plates.length > 0) {
        const { data: ordensServico } = await supabase
          .from("ordens_servico")
          .select("id, plate")
          .in("plate", plates)
          .not("status", "eq", "concluido");

        if (ordensServico) {
          ordensServico.forEach((os) => {
            osMap[os.plate.toUpperCase()] = os.id;
          });
        }
      }

      // Converter cards do Trello para PatioItems
      const patioItems: PatioItem[] = trelloCards
        .map((card): PatioItem | null => {
          const status = listIdToStatus[card.idList];
          if (!status) return null;

          const { plate, vehicle, client } = parseCardName(card.name);
          const upperPlate = plate.toUpperCase();

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
            osId: osMap[upperPlate],
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
