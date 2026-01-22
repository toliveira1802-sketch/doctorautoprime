import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Database,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    PlayCircle,
    RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MigrationConfig {
    trelloApiKey: string;
    trelloToken: string;
    trelloBoardId: string;
    supabaseUrl: string;
    supabaseServiceKey: string;
}

interface MigrationLog {
    tipo: 'info' | 'success' | 'error' | 'warning';
    mensagem: string;
    timestamp: Date;
}

interface TrelloCard {
    id: string;
    name: string;
    desc: string;
    url: string;
    idList: string;
    closed: boolean;
    dateLastActivity: string;
    labels: Array<{ name: string; color: string }>;
    members?: Array<{ fullName: string }>;
}

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

const LABEL_PARA_PRIORIDADE: Record<string, string> = {
    "URGENTE": "urgente",
    "ALTA": "alta",
    "MÉDIA": "media",
    "BAIXA": "baixa",
};

const COLOR_MAP: Record<string, string> = {
    "red": "#ef4444",
    "orange": "#f97316",
    "yellow": "#eab308",
    "green": "#22c55e",
    "blue": "#3b82f6",
    "purple": "#a855f7",
};

export default function MigracaoTrello() {
    const [config, setConfig] = useState<MigrationConfig>({
        trelloApiKey: "e327cf4891fd2fcb6020899e3718c45e",
        trelloToken: "ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7",
        trelloBoardId: "NkhINjF2",
        supabaseUrl: "https://acuufrgoyjwzlyhopaus.supabase.co",
        supabaseServiceKey: "",
    });

    const [showKeys, setShowKeys] = useState(false);
    const [testando, setTestando] = useState(false);
    const [migrando, setMigrando] = useState(false);
    const [progresso, setProgresso] = useState(0);
    const [logs, setLogs] = useState<MigrationLog[]>([]);
    const [estatisticas, setEstatisticas] = useState({
        totalCards: 0,
        migrados: 0,
        erros: 0,
        pulados: 0,
    });

    const addLog = (tipo: MigrationLog['tipo'], mensagem: string) => {
        setLogs(prev => [...prev, { tipo, mensagem, timestamp: new Date() }]);
    };

    const testarConexoes = async () => {
        setTestando(true);
        setLogs([]);

        try {
            // Testa Trello
            addLog('info', '🔍 Testando conexão com Trello...');
            const trelloUrl = `https://api.trello.com/1/boards/${config.trelloBoardId}?key=${config.trelloApiKey}&token=${config.trelloToken}`;
            const trelloRes = await fetch(trelloUrl);

            if (trelloRes.ok) {
                const boardData = await trelloRes.json();
                addLog('success', `✅ Trello conectado! Board: "${boardData.name}"`);
            } else {
                addLog('error', `❌ Erro ao conectar Trello: ${trelloRes.status}`);
                setTestando(false);
                return;
            }

            // Testa Supabase
            addLog('info', '🔍 Testando conexão com Supabase...');
            const supabaseRes = await fetch(`${config.supabaseUrl}/rest/v1/ordens_servico?limit=1`, {
                headers: {
                    'apikey': config.supabaseServiceKey,
                    'Authorization': `Bearer ${config.supabaseServiceKey}`,
                }
            });

            if (supabaseRes.ok) {
                addLog('success', '✅ Supabase conectado! Tabela ordens_servico acessível');
            } else {
                const error = await supabaseRes.text();
                addLog('error', `❌ Erro ao conectar Supabase: ${supabaseRes.status} - ${error}`);
                setTestando(false);
                return;
            }

            // Busca cards do Trello
            addLog('info', '📋 Buscando cards do Trello...');
            const cardsUrl = `https://api.trello.com/1/boards/${config.trelloBoardId}/cards?key=${config.trelloApiKey}&token=${config.trelloToken}`;
            const cardsRes = await fetch(cardsUrl);

            if (cardsRes.ok) {
                const cards = await cardsRes.json();
                const activeCards = cards.filter((c: TrelloCard) => !c.closed);
                addLog('success', `✅ Encontrados ${activeCards.length} cards ativos (${cards.length} total)`);
                setEstatisticas(prev => ({ ...prev, totalCards: activeCards.length }));
            }

            addLog('success', '🎉 Todos os testes passaram! Pronto para migrar.');

        } catch (error) {
            addLog('error', `❌ Erro: ${error}`);
        } finally {
            setTestando(false);
        }
    };

    const executarMigracao = async () => {
        if (!config.supabaseServiceKey) {
            addLog('error', '❌ Service Role Key do Supabase não configurada!');
            return;
        }

        setMigrando(true);
        setProgresso(0);
        setLogs([]);
        setEstatisticas({ totalCards: 0, migrados: 0, erros: 0, pulados: 0 });

        try {
            // 1. Busca listas
            addLog('info', '📋 Buscando listas do Trello...');
            const listsUrl = `https://api.trello.com/1/boards/${config.trelloBoardId}/lists?key=${config.trelloApiKey}&token=${config.trelloToken}`;
            const listsRes = await fetch(listsUrl);
            const lists = await listsRes.json();

            const listsMap: Record<string, string> = {};
            lists.forEach((list: any) => {
                listsMap[list.id] = list.name;
            });

            addLog('success', `✅ ${lists.length} listas encontradas`);

            // 2. Busca cards
            addLog('info', '🃏 Buscando cards do Trello...');
            const cardsUrl = `https://api.trello.com/1/boards/${config.trelloBoardId}/cards?key=${config.trelloApiKey}&token=${config.trelloToken}&labels=true&members=true`;
            const cardsRes = await fetch(cardsUrl);
            const cards: TrelloCard[] = await cardsRes.json();

            const activeCards = cards.filter(c => !c.closed);
            addLog('success', `✅ ${activeCards.length} cards ativos encontrados`);
            setEstatisticas(prev => ({ ...prev, totalCards: activeCards.length }));

            // 3. Migra cada card
            addLog('info', '💾 Iniciando migração...');

            for (let i = 0; i < activeCards.length; i++) {
                const card = activeCards[i];
                const listName = listsMap[card.idList] || "DESCONHECIDO";

                try {
                    // Converte card para OS
                    const osData = parseTrelloCardToOS(card, listName);

                    // Insere no Supabase
                    const insertRes = await fetch(`${config.supabaseUrl}/rest/v1/ordens_servico`, {
                        method: 'POST',
                        headers: {
                            'apikey': config.supabaseServiceKey,
                            'Authorization': `Bearer ${config.supabaseServiceKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(osData)
                    });

                    if (insertRes.ok) {
                        addLog('success', `✅ ${card.name} (${listName})`);
                        setEstatisticas(prev => ({ ...prev, migrados: prev.migrados + 1 }));
                    } else {
                        const error = await insertRes.text();
                        addLog('error', `❌ ${card.name}: ${error}`);
                        setEstatisticas(prev => ({ ...prev, erros: prev.erros + 1 }));
                    }
                } catch (error) {
                    addLog('error', `❌ ${card.name}: ${error}`);
                    setEstatisticas(prev => ({ ...prev, erros: prev.erros + 1 }));
                }

                // Atualiza progresso
                setProgresso(Math.round(((i + 1) / activeCards.length) * 100));
            }

            // 4. Resumo
            addLog('success', '🎉 Migração concluída!');
            addLog('info', `📊 Resumo: ${estatisticas.migrados} migrados, ${estatisticas.erros} erros`);

        } catch (error) {
            addLog('error', `❌ Erro fatal: ${error}`);
        } finally {
            setMigrando(false);
        }
    };

    const parseTrelloCardToOS = (card: TrelloCard, listName: string) => {
        let placa = "";
        let veiculo = "";

        if (card.name.includes(" - ")) {
            const parts = card.name.split(" - ", 2);
            placa = parts[0].trim();
            veiculo = parts[1]?.trim() || "";
        } else {
            veiculo = card.name;
        }

        const posicaoPatio = LISTA_PARA_POSICAO[listName] || "entrada";

        let prioridade = "media";
        let corCard = "#3b82f6";
        const tags: string[] = [];

        for (const label of card.labels || []) {
            const labelName = label.name.toUpperCase();
            if (labelName in LABEL_PARA_PRIORIDADE) {
                prioridade = LABEL_PARA_PRIORIDADE[labelName];
            }
            if (label.color in COLOR_MAP) {
                corCard = COLOR_MAP[label.color];
            }
            if (labelName) {
                tags.push(labelName.toLowerCase());
            }
        }

        const mecanicoResponsavel = card.members?.[0]?.fullName;

        return {
            client_name: veiculo,
            client_phone: "",
            vehicle_plate: placa,
            vehicle_model: veiculo,
            service_description: card.desc || "Migrado do Trello",
            status: "em_andamento",
            posicao_patio: posicaoPatio,
            prioridade: prioridade,
            cor_card: corCard,
            tags: tags,
            mecanico_responsavel: mecanicoResponsavel,
            observacoes_patio: `Migrado do Trello\nCard ID: ${card.id}\nURL: ${card.url}`,
            data_entrada: card.dateLastActivity || new Date().toISOString(),
            trello_card_id: card.id,
            trello_card_url: card.url,
        };
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Database className="w-8 h-8" />
                    Migração Trello → Supabase
                </h1>
                <p className="text-muted-foreground mt-2">
                    Migre todos os cards do Trello Board para a tabela ordens_servico do Supabase
                </p>
            </div>

            {/* Configuração */}
            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Configuração</CardTitle>
                    <CardDescription>
                        Configure as credenciais do Trello e Supabase
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Trello */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Trello</h3>

                        <div>
                            <Label htmlFor="trelloApiKey">API Key</Label>
                            <Input
                                id="trelloApiKey"
                                type={showKeys ? "text" : "password"}
                                value={config.trelloApiKey}
                                onChange={(e) => setConfig({ ...config, trelloApiKey: e.target.value })}
                                placeholder="Trello API Key"
                            />
                        </div>

                        <div>
                            <Label htmlFor="trelloToken">Token</Label>
                            <Input
                                id="trelloToken"
                                type={showKeys ? "text" : "password"}
                                value={config.trelloToken}
                                onChange={(e) => setConfig({ ...config, trelloToken: e.target.value })}
                                placeholder="Trello Token"
                            />
                        </div>

                        <div>
                            <Label htmlFor="trelloBoardId">Board ID</Label>
                            <Input
                                id="trelloBoardId"
                                value={config.trelloBoardId}
                                onChange={(e) => setConfig({ ...config, trelloBoardId: e.target.value })}
                                placeholder="NkhINjF2"
                            />
                        </div>
                    </div>

                    {/* Supabase */}
                    <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-semibold text-sm">Supabase</h3>

                        <div>
                            <Label htmlFor="supabaseUrl">URL</Label>
                            <Input
                                id="supabaseUrl"
                                value={config.supabaseUrl}
                                onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                                placeholder="https://xxx.supabase.co"
                            />
                        </div>

                        <div>
                            <Label htmlFor="supabaseServiceKey">Service Role Key</Label>
                            <Input
                                id="supabaseServiceKey"
                                type={showKeys ? "text" : "password"}
                                value={config.supabaseServiceKey}
                                onChange={(e) => setConfig({ ...config, supabaseServiceKey: e.target.value })}
                                placeholder="eyJhbGci..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                ⚠️ Obtenha em: Settings → API → Service Role Key
                            </p>
                        </div>
                    </div>

                    {/* Toggle mostrar chaves */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKeys(!showKeys)}
                        className="w-full"
                    >
                        {showKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showKeys ? "Ocultar" : "Mostrar"} Chaves
                    </Button>
                </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex gap-3">
                <Button
                    onClick={testarConexoes}
                    disabled={testando || migrando}
                    variant="outline"
                    className="flex-1"
                >
                    {testando ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Testar Conexões
                </Button>

                <Button
                    onClick={executarMigracao}
                    disabled={testando || migrando || !config.supabaseServiceKey}
                    className="flex-1"
                >
                    {migrando ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <PlayCircle className="w-4 h-4 mr-2" />
                    )}
                    Executar Migração
                </Button>
            </div>

            {/* Progresso */}
            {migrando && (
                <Card>
                    <CardHeader>
                        <CardTitle>📊 Progresso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={progresso} className="w-full" />
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold">{estatisticas.totalCards}</div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{estatisticas.migrados}</div>
                                <div className="text-xs text-muted-foreground">Migrados</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">{estatisticas.erros}</div>
                                <div className="text-xs text-muted-foreground">Erros</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">{estatisticas.pulados}</div>
                                <div className="text-xs text-muted-foreground">Pulados</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Logs */}
            {logs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>📝 Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {logs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    {log.tipo === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />}
                                    {log.tipo === 'error' && <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                                    {log.tipo === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />}
                                    {log.tipo === 'info' && <Download className="w-4 h-4 text-blue-600 mt-0.5" />}
                                    <span className="flex-1">{log.mensagem}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {log.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Informações */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Importante:</strong> Esta migração é <strong>única</strong>. Execute apenas uma vez para evitar duplicatas.
                    Faça backup do banco antes de executar.
                </AlertDescription>
            </Alert>
        </div>
    );
}
