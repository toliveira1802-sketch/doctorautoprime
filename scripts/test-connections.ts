/**
 * Script de Teste: Verifica conexões com Trello e Supabase
 * Execute: npx tsx scripts/test-connections.ts
 */

// ========== CONFIGURAÇÕES ==========
const TRELLO_API_KEY = "e327cf4891fd2fcb6020899e3718c45e";
const TRELLO_TOKEN = "ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7";
const TRELLO_BOARD_ID = "NkhINjF2";

const SUPABASE_URL = "https://acuufrgoyjwzlyhopaus.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdXVmcmdveWp3emx5aG9wYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MzQ5ODgsImV4cCI6MjA1MjMxMDk4OH0.Hh6QLdZqMZjQAcWXGPGBxXTaHJjqvNqVEPZfFHlQWEw";

// ========== TESTES ==========

async function testTrelloConnection(): Promise<[boolean, string]> {
    try {
        const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            return [true, `Board encontrado: ${data.name}`];
        } else {
            return [false, `Erro HTTP ${response.status}`];
        }
    } catch (error) {
        return [false, `Erro de conexão: ${error}`];
    }
}

async function testTrelloLists(): Promise<[boolean, string]> {
    try {
        const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
        const response = await fetch(url);

        if (response.ok) {
            const lists = await response.json();
            const listNames = lists.map((l: any) => l.name).join(', ');
            return [true, `Encontradas ${lists.length} listas: ${listNames}`];
        } else {
            return [false, `Erro HTTP ${response.status}`];
        }
    } catch (error) {
        return [false, `Erro: ${error}`];
    }
}

async function testTrelloCards(): Promise<[boolean, string]> {
    try {
        const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
        const response = await fetch(url);

        if (response.ok) {
            const cards = await response.json();
            const activeCards = cards.filter((c: any) => !c.closed);
            return [true, `Encontrados ${activeCards.length} cards ativos (de ${cards.length} total)`];
        } else {
            return [false, `Erro HTTP ${response.status}`];
        }
    } catch (error) {
        return [false, `Erro: ${error}`];
    }
}

async function testSupabaseConnection(): Promise<[boolean, string]> {
    try {
        const url = `${SUPABASE_URL}/rest/v1/`;
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        });

        if (response.ok || response.status === 404) {
            return [true, "Conexão estabelecida"];
        } else {
            return [false, `Erro HTTP ${response.status}`];
        }
    } catch (error) {
        return [false, `Erro de conexão: ${error}`];
    }
}

async function testSupabaseTable(): Promise<[boolean, string]> {
    try {
        const url = `${SUPABASE_URL}/rest/v1/ordens_servico?limit=1`;
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            return [true, `Tabela acessível (${data.length} registros no teste)`];
        } else {
            const text = await response.text();
            return [false, `Erro HTTP ${response.status}: ${text}`];
        }
    } catch (error) {
        return [false, `Erro: ${error}`];
    }
}

async function testSupabaseInsert(): Promise<[boolean, string]> {
    try {
        const url = `${SUPABASE_URL}/rest/v1/ordens_servico`;

        // Dados de teste
        const testData = {
            client_name: "TESTE MIGRAÇÃO",
            client_phone: "00000000000",
            vehicle_plate: "TST-0000",
            vehicle_model: "Teste",
            service_description: "Teste de inserção - será deletado",
            status: "orcamento",
            posicao_patio: "entrada",
        };

        // Tenta inserir
        const insertResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testData)
        });

        if (insertResponse.ok) {
            const inserted = await insertResponse.json();
            if (inserted && inserted.length > 0) {
                const insertedId = inserted[0].id;

                // Tenta deletar
                const deleteResponse = await fetch(`${url}?id=eq.${insertedId}`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                    }
                });

                if (deleteResponse.ok) {
                    return [true, "Inserção e deleção bem-sucedidas"];
                } else {
                    return [true, `Inserção OK, mas erro ao deletar (ID: ${insertedId})`];
                }
            } else {
                return [true, "Inserção bem-sucedida"];
            }
        } else {
            const text = await insertResponse.text();
            return [false, `Erro HTTP ${insertResponse.status}: ${text}`];
        }
    } catch (error) {
        return [false, `Erro: ${error}`];
    }
}

// ========== MAIN ==========

async function main() {
    console.log("🔍 TESTE DE CONEXÕES - Migração Trello → Supabase");
    console.log("=".repeat(60));
    console.log();

    const tests: [string, () => Promise<[boolean, string]>][] = [
        ["🔗 Conexão com Trello", testTrelloConnection],
        ["📋 Listas do Trello", testTrelloLists],
        ["🃏 Cards do Trello", testTrelloCards],
        ["🔗 Conexão com Supabase", testSupabaseConnection],
        ["📊 Tabela ordens_servico", testSupabaseTable],
        ["💾 Permissão de inserção", testSupabaseInsert],
    ];

    const results: boolean[] = [];

    for (const [testName, testFunc] of tests) {
        process.stdout.write(`${testName}... `);
        const [success, message] = await testFunc();

        if (success) {
            console.log(`✅ ${message}`);
            results.push(true);
        } else {
            console.log(`❌ ${message}`);
            results.push(false);
        }

        console.log();
    }

    // Resumo
    console.log("=".repeat(60));
    const passed = results.filter(r => r).length;
    const total = results.length;

    if (passed === total) {
        console.log(`✅ TODOS OS TESTES PASSARAM (${passed}/${total})`);
        console.log("\n🚀 Você pode executar a migração com segurança!");
    } else {
        console.log(`⚠️  ALGUNS TESTES FALHARAM (${passed}/${total})`);
        console.log("\n❌ Corrija os erros antes de executar a migração!");
    }

    console.log("=".repeat(60));
}

main().catch(console.error);
