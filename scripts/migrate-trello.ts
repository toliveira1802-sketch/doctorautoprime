/**
 * Script de Migração: Trello → Supabase
 * Migra todos os cards do Trello Board NkhINjF2 para a tabela ordens_servico
 * 
 * Execute: npx tsx scripts/migrate-trello.ts
 */

// ========== CONFIGURAÇÕES ==========
const TRELLO_API_KEY = "e327cf4891fd2fcb6020899e3718c45e";
const TRELLO_TOKEN = "ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7";
const TRELLO_BOARD_ID = "NkhINjF2";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://acuufrgoyjwzlyhopaus.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_KEY) {
    console.error("❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada!");
    console.error("📖 Leia: scripts/COMO_OBTER_SERVICE_ROLE_KEY.md");
    process.exit(1);
}

// Mapeamento de listas do Trello para posições do Pátio
const LISTA_PARA_POSICAO: Record<string, string> = {
    "AGENDADOS HOJE": "entrada",
    "DIAGNÓSTICO": "entrada",
    "ORÇAMENTOS": "aguardando_orcamento",
    "AGUARD. APROVAÇÃO": "aguardando_aprovacao",
    "AGUARD. PEÇAS": "aguardando_pecas",
    "PRONTO P/ INICIAR": "aguardando_pecas",
    "EM EXECUÇÃO": "em_execucao",
    "PRONTOS": "pronto",
};

// Mapeamento de labels do Trello para prioridades
const LABEL_PARA_PRIORIDADE: Record<string, string> = {
    "URGENTE": "urgente",
    "ALTA": "alta",
    "MÉDIA": "media",
    "BAIXA": "baixa",
};

// Mapeamento de cores
const COLOR_MAP: Record<string, string> = {
    "red": "#ef4444",
    "orange": "#f97316",
    "yellow": "#eab308",
    "green": "#22c55e",
    "blue": "#3b82f6",
    "purple": "#a855f7",
};

// ========== TIPOS ==========

interface TrelloList {
    id: string;
    name: string;
}

interface TrelloLabel {
    name: string;
    color: string;
}

interface TrelloMember {
    fullName: string;
}

interface TrelloCard {
    id: string;
    name: string;
    desc: string;
    url: string;
    idList: string;
    closed: boolean;
    dateLastActivity: string;
    labels: TrelloLabel[];
    members?: TrelloMember[];
}

interface OrdemServico {
    client_name: string;
    client_phone: string;
    vehicle_plate: string;
    vehicle_model: string;
    service_description: string;
    status: string;
    posicao_patio: string;
    prioridade: string;
    cor_card: string;
    tags: string[];
    mecanico_responsavel?: string;
    observacoes_patio: string;
    data_entrada: string;
    trello_card_id: string;
    trello_card_url: string;
}

// ========== FUNÇÕES TRELLO ==========

async function getTrelloBoardLists(): Promise<Record<string, string>> {
    const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro ao buscar listas: ${response.status}`);
    }

    const lists: TrelloList[] = await response.json();
    const listsMap: Record<string, string> = {};

    for (const list of lists) {
        listsMap[list.id] = list.name;
    }

    return listsMap;
}

async function getTrelloCards(): Promise<TrelloCard[]> {
    const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true&fields=all&members=true&labels=true`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro ao buscar cards: ${response.status}`);
    }

    return response.json();
}

// ========== FUNÇÕES SUPABASE ==========

async function insertOrdemServico(data: OrdemServico): Promise<boolean> {
    const url = `${SUPABASE_URL}/rest/v1/ordens_servico`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        return true;
    } else {
        const text = await response.text();
        console.error(`❌ Erro ao inserir: ${response.status} - ${text}`);
        return false;
    }
}

// ========== CONVERSÃO ==========

function parseTrelloCardToOS(card: TrelloCard, listName: string): OrdemServico {
    // Extrai informações básicas
    const cardName = card.name || "";
    const cardDesc = card.desc || "";
    const cardUrl = card.url || "";
    const cardId = card.id || "";

    // Tenta extrair placa do nome (formato comum: "ABC-1234 - Descrição")
    let placa = "";
    let veiculo = "";

    if (cardName.includes(" - ")) {
        const parts = cardName.split(" - ", 2);
        placa = parts[0].trim();
        veiculo = parts[1]?.trim() || "";
    } else {
        veiculo = cardName;
    }

    // Determina posição do pátio baseado na lista
    const posicaoPatio = LISTA_PARA_POSICAO[listName] || "entrada";

    // Determina prioridade baseado nas labels
    let prioridade = "media";
    let corCard = "#3b82f6"; // Azul padrão
    const tags: string[] = [];

    for (const label of card.labels || []) {
        const labelName = label.name.toUpperCase();
        const labelColor = label.color;

        // Mapeia prioridade
        if (labelName in LABEL_PARA_PRIORIDADE) {
            prioridade = LABEL_PARA_PRIORIDADE[labelName];
        }

        // Mapeia cor
        if (labelColor in COLOR_MAP) {
            corCard = COLOR_MAP[labelColor];
        }

        // Adiciona tag
        if (labelName) {
            tags.push(labelName.toLowerCase());
        }
    }

    // Extrai mecânico responsável (se houver membros)
    const mecanicoResponsavel = card.members?.[0]?.fullName;

    // Monta objeto da ordem de serviço
    const osData: OrdemServico = {
        client_name: veiculo, // Temporário até ter dados reais
        client_phone: "",
        vehicle_plate: placa,
        vehicle_model: veiculo,
        service_description: cardDesc || "Migrado do Trello",
        status: "em_andamento",
        posicao_patio: posicaoPatio,
        prioridade: prioridade,
        cor_card: corCard,
        tags: tags,
        mecanico_responsavel: mecanicoResponsavel,
        observacoes_patio: `Migrado do Trello\nCard ID: ${cardId}\nURL: ${cardUrl}`,
        data_entrada: card.dateLastActivity || new Date().toISOString(),
        trello_card_id: cardId,
        trello_card_url: cardUrl,
    };

    return osData;
}

// ========== MAIN ==========

async function main() {
    console.log("🚀 Iniciando migração Trello → Supabase\n");

    // 1. Busca listas do Trello
    console.log("📋 Buscando listas do Trello...");
    const lists = await getTrelloBoardLists();
    console.log(`✅ Encontradas ${Object.keys(lists).length} listas\n`);

    for (const [listId, listName] of Object.entries(lists)) {
        console.log(`  - ${listName}`);
    }
    console.log();

    // 2. Busca cards do Trello
    console.log("🃏 Buscando cards do Trello...");
    const cards = await getTrelloCards();
    console.log(`✅ Encontrados ${cards.length} cards\n`);

    // 3. Converte e insere no Supabase
    console.log("💾 Migrando para Supabase...");
    let successCount = 0;
    let errorCount = 0;

    for (const card of cards) {
        const listId = card.idList;
        const listName = lists[listId] || "DESCONHECIDO";

        // Pula cards arquivados
        if (card.closed) {
            console.log(`⏭️  Pulando card arquivado: ${card.name}`);
            continue;
        }

        // Converte card para OS
        const osData = parseTrelloCardToOS(card, listName);

        // Insere no Supabase
        console.log(`📤 Migrando: ${card.name} (${listName})`);

        if (await insertOrdemServico(osData)) {
            successCount++;
            console.log(`   ✅ Sucesso!`);
        } else {
            errorCount++;
            console.log(`   ❌ Erro!`);
        }

        console.log();
    }

    // 4. Resumo
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMO DA MIGRAÇÃO");
    console.log("=".repeat(50));
    console.log(`✅ Migrados com sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📋 Total processado: ${cards.length}`);
    console.log("=".repeat(50));

    if (errorCount === 0) {
        console.log("\n🎉 Migração concluída com sucesso!");
    } else {
        console.log(`\n⚠️  Migração concluída com ${errorCount} erros`);
    }
}

main().catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
});
