/**
 * EXEMPLOS DE USO - Integração Kommo
 * 
 * Este arquivo contém exemplos práticos de como usar a integração Kommo
 * em diferentes partes do sistema.
 */

// ============================================
// 1. SINCRONIZAR OS MANUALMENTE
// ============================================

import { useKommo } from '@/hooks/useKommo';

function ExemploSincronizarOS() {
    const { syncOS, syncing, isConnected } = useKommo();

    const handleSync = async (osId: string) => {
        if (!isConnected) {
            alert('Kommo não está conectado');
            return;
        }

        try {
            const leadId = await syncOS(osId);
            console.log('Lead criado:', leadId);
            alert('OS sincronizada com sucesso!');
        } catch (error: any) {
            console.error('Erro ao sincronizar:', error);
            alert('Erro: ' + error.message);
        }
    };

    return (
        <button onClick={() => handleSync('os-uuid-aqui')} disabled={syncing}>
            {syncing ? 'Sincronizando...' : 'Sincronizar com Kommo'}
        </button>
    );
}

// ============================================
// 2. USAR BOTÃO DE SYNC PRONTO
// ============================================

import { KommoSyncButton } from '@/components/kommo/KommoSyncButton';

function ExemploUsarBotao() {
    const osId = 'uuid-da-os';

    return (
        <div className="flex gap-2">
            {/* Botão padrão */}
            <KommoSyncButton osId={osId} />

            {/* Botão sem label */}
            <KommoSyncButton osId={osId} showLabel={false} size="icon" />

            {/* Botão grande */}
            <KommoSyncButton osId={osId} variant="default" size="lg" />
        </div>
    );
}

// ============================================
// 3. VERIFICAR STATUS DA CONEXÃO
// ============================================

function ExemploVerificarConexao() {
    const { isConnected, config, loading } = useKommo();

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!isConnected) {
        return (
            <div className="alert alert-warning">
                <p>Kommo não está conectado</p>
                <a href="/gestao/integracoes/kommo">Configurar agora</a>
            </div>
        );
    }

    return (
        <div className="alert alert-success">
            <p>✅ Conectado ao Kommo</p>
            <p>Subdomínio: {config?.subdomain}</p>
        </div>
    );
}

// ============================================
// 4. VER LOGS DE SINCRONIZAÇÃO
// ============================================

function ExemploVerLogs() {
    const { getSyncLogs } = useKommo();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        // Todos os logs
        const allLogs = await getSyncLogs();

        // Logs de uma OS específica
        const osLogs = await getSyncLogs('os-uuid-aqui');

        setLogs(allLogs);
    };

    return (
        <div>
            <h3>Logs de Sincronização</h3>
            {logs.map((log: any) => (
                <div key={log.id} className={log.status === 'error' ? 'text-red-500' : ''}>
                    <p>{log.action} - {log.status}</p>
                    <p>{new Date(log.created_at).toLocaleString()}</p>
                    {log.error_message && <p>Erro: {log.error_message}</p>}
                </div>
            ))}
        </div>
    );
}

// ============================================
// 5. SINCRONIZAR AO CRIAR OS
// ============================================

function ExemploSincronizarAoCriar() {
    const { syncOS, isConnected } = useKommo();

    const handleCreateOS = async (osData: any) => {
        // 1. Cria OS no banco
        const { data: os, error } = await supabase
            .from('ordens_servico')
            .insert(osData)
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar OS:', error);
            return;
        }

        // 2. Sincroniza com Kommo (se conectado)
        if (isConnected && os) {
            try {
                await syncOS(os.id);
                console.log('OS sincronizada com Kommo');
            } catch (error) {
                console.error('Erro ao sincronizar com Kommo:', error);
                // Não bloqueia a criação da OS se falhar
            }
        }

        return os;
    };

    return <button onClick={() => handleCreateOS({})}>Criar OS</button>;
}

// ============================================
// 6. ADICIONAR BOTÃO NO CARD DO PÁTIO
// ============================================

function ExemploCardPatio({ os }: { os: any }) {
    return (
        <div className="card">
            <h3>{os.numero_os}</h3>
            <p>{os.vehicle} - {os.plate}</p>
            <p>Status: {os.status}</p>

            <div className="flex gap-2 mt-4">
                <button>Ver Detalhes</button>
                <KommoSyncButton osId={os.id} variant="outline" size="sm" />
            </div>
        </div>
    );
}

// ============================================
// 7. ADICIONAR BOTÃO NA PÁGINA DE DETALHES
// ============================================

function ExemploPaginaDetalhes({ osId }: { osId: string }) {
    const { isConnected } = useKommo();

    return (
        <div className="page">
            <div className="header">
                <h1>Ordem de Serviço</h1>
                {isConnected && (
                    <KommoSyncButton osId={osId} variant="default" />
                )}
            </div>

            {/* Resto da página */}
        </div>
    );
}

// ============================================
// 8. DESCONECTAR DO KOMMO
// ============================================

function ExemploDesconectar() {
    const { disconnect, isConnected } = useKommo();

    const handleDisconnect = async () => {
        if (!confirm('Deseja realmente desconectar do Kommo?')) {
            return;
        }

        try {
            await disconnect();
            alert('Desconectado com sucesso!');
        } catch (error: any) {
            alert('Erro ao desconectar: ' + error.message);
        }
    };

    if (!isConnected) {
        return null;
    }

    return (
        <button onClick={handleDisconnect} className="btn-danger">
            Desconectar Kommo
        </button>
    );
}

// ============================================
// 9. USAR CLIENTE KOMMO DIRETAMENTE
// ============================================

function ExemploUsarClienteDireto() {
    const { createClient } = useKommo();

    const buscarLeads = async () => {
        const client = createClient();
        if (!client) {
            console.error('Kommo não configurado');
            return;
        }

        try {
            // Buscar todos os leads
            const leads = await client.getLeads();
            console.log('Leads:', leads);

            // Buscar lead específico
            const lead = await client.getLead(123456);
            console.log('Lead:', lead);

            // Criar lead manualmente
            const newLead = await client.createLead({
                name: 'Teste Lead',
                price: 1000,
            });
            console.log('Lead criado:', newLead);

            // Adicionar nota
            await client.addNote({
                entity_id: newLead.id!,
                entity_type: 'leads',
                note_type: 'common',
                params: {
                    text: 'Nota de teste',
                },
            });
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    return <button onClick={buscarLeads}>Buscar Leads</button>;
}

// ============================================
// 10. CONFIGURAÇÃO PROGRAMÁTICA
// ============================================

function ExemploConfigurarProgramaticamente() {
    const { saveConfig, getAuthUrl } = useKommo();

    const handleConfigure = async () => {
        try {
            // Salva configuração
            await saveConfig({
                subdomain: 'doctorautoprime',
                client_id: 'seu-client-id',
                client_secret: 'seu-client-secret',
                redirect_uri: window.location.origin + '/kommo/callback',
            });

            // Redireciona para autenticação
            const authUrl = getAuthUrl();
            if (authUrl) {
                window.location.href = authUrl;
            }
        } catch (error: any) {
            console.error('Erro ao configurar:', error);
        }
    };

    return <button onClick={handleConfigure}>Configurar Kommo</button>;
}

// ============================================
// EXPORT PARA USO EM OUTROS ARQUIVOS
// ============================================

export {
    ExemploSincronizarOS,
    ExemploUsarBotao,
    ExemploVerificarConexao,
    ExemploVerLogs,
    ExemploSincronizarAoCriar,
    ExemploCardPatio,
    ExemploPaginaDetalhes,
    ExemploDesconectar,
    ExemploUsarClienteDireto,
    ExemploConfigurarProgramaticamente,
};
