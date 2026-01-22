/**
 * Página de configuração da integração com Kommo
 */

import { useState, useEffect } from 'react';
import { useKommo } from '@/hooks/useKommo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle2,
    XCircle,
    Settings,
    RefreshCw,
    ExternalLink,
    AlertCircle,
    Loader2,
} from 'lucide-react';

export default function KommoIntegracao() {
    const {
        config,
        loading,
        syncing,
        isConnected,
        saveConfig,
        getAuthUrl,
        disconnect,
        getSyncLogs,
    } = useKommo();

    const [formData, setFormData] = useState({
        subdomain: '',
        client_id: '',
        client_secret: '',
        redirect_uri: window.location.origin + '/kommo/callback',
    });

    const [logs, setLogs] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (config) {
            setFormData({
                subdomain: config.subdomain,
                client_id: config.client_id,
                client_secret: config.client_secret,
                redirect_uri: config.redirect_uri,
            });
        }
    }, [config]);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        const data = await getSyncLogs();
        setLogs(data);
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await saveConfig(formData);
            alert('Configuração salva com sucesso!');
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleConnect = () => {
        const authUrl = getAuthUrl();
        if (authUrl) {
            window.location.href = authUrl;
        }
    };

    const handleDisconnect = async () => {
        if (confirm('Deseja realmente desconectar do Kommo?')) {
            try {
                await disconnect();
                alert('Desconectado com sucesso!');
            } catch (error: any) {
                alert('Erro ao desconectar: ' + error.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Integração Kommo CRM</h1>
                <p className="text-muted-foreground">
                    Sincronize suas Ordens de Serviço com o Kommo automaticamente
                </p>
            </div>

            {/* Status da Conexão */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Status da Integração</CardTitle>
                            <CardDescription>
                                {isConnected
                                    ? 'Conectado e sincronizando automaticamente'
                                    : 'Configure e conecte sua conta Kommo'}
                            </CardDescription>
                        </div>
                        <Badge
                            variant={isConnected ? 'default' : 'secondary'}
                            className="flex items-center gap-2"
                        >
                            {isConnected ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Conectado
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4" />
                                    Desconectado
                                </>
                            )}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="config" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="config">
                        <Settings className="w-4 h-4 mr-2" />
                        Configuração
                    </TabsTrigger>
                    <TabsTrigger value="logs">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Logs de Sincronização
                    </TabsTrigger>
                    <TabsTrigger value="docs">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Documentação
                    </TabsTrigger>
                </TabsList>

                {/* Aba de Configuração */}
                <TabsContent value="config">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração OAuth</CardTitle>
                            <CardDescription>
                                Configure as credenciais da sua integração Kommo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveConfig} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subdomain">Subdomínio Kommo</Label>
                                    <Input
                                        id="subdomain"
                                        placeholder="seu-dominio (sem .kommo.com)"
                                        value={formData.subdomain}
                                        onChange={(e) =>
                                            setFormData({ ...formData, subdomain: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Exemplo: se sua URL é doctorautoprime.kommo.com, use apenas
                                        "doctorautoprime"
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client_id">Client ID</Label>
                                    <Input
                                        id="client_id"
                                        placeholder="abc123..."
                                        value={formData.client_id}
                                        onChange={(e) =>
                                            setFormData({ ...formData, client_id: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client_secret">Client Secret</Label>
                                    <Input
                                        id="client_secret"
                                        type="password"
                                        placeholder="xyz789..."
                                        value={formData.client_secret}
                                        onChange={(e) =>
                                            setFormData({ ...formData, client_secret: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="redirect_uri">Redirect URI</Label>
                                    <Input
                                        id="redirect_uri"
                                        value={formData.redirect_uri}
                                        onChange={(e) =>
                                            setFormData({ ...formData, redirect_uri: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Use esta URL nas configurações da sua integração no Kommo
                                    </p>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Após salvar, clique em "Conectar com Kommo" para autorizar a
                                        integração
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-3">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            'Salvar Configuração'
                                        )}
                                    </Button>

                                    {config && !isConnected && (
                                        <Button type="button" onClick={handleConnect} variant="default">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Conectar com Kommo
                                        </Button>
                                    )}

                                    {isConnected && (
                                        <Button
                                            type="button"
                                            onClick={handleDisconnect}
                                            variant="destructive"
                                        >
                                            Desconectar
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba de Logs */}
                <TabsContent value="logs">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Histórico de Sincronizações</CardTitle>
                                    <CardDescription>
                                        Últimas 50 sincronizações realizadas
                                    </CardDescription>
                                </div>
                                <Button onClick={loadLogs} variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Atualizar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {logs.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Nenhuma sincronização realizada ainda
                                    </p>
                                ) : (
                                    logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {log.status === 'success' ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{log.action}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        OS: {log.os_id}
                                                    </p>
                                                    {log.error_message && (
                                                        <p className="text-sm text-red-500">
                                                            {log.error_message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(log.created_at).toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba de Documentação */}
                <TabsContent value="docs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Como Configurar</CardTitle>
                            <CardDescription>
                                Siga os passos abaixo para integrar com o Kommo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <h3>1. Criar Integração no Kommo</h3>
                            <ol>
                                <li>Acesse sua conta Kommo</li>
                                <li>Vá em Configurações → Integrações → API</li>
                                <li>Clique em "Criar Integração"</li>
                                <li>Copie o Client ID e Client Secret</li>
                                <li>
                                    Configure a Redirect URI como:{' '}
                                    <code>{window.location.origin}/kommo/callback</code>
                                </li>
                            </ol>

                            <h3>2. Configurar Campos Personalizados</h3>
                            <p>Crie os seguintes campos personalizados para Leads:</p>
                            <ul>
                                <li>
                                    <strong>Placa</strong> (texto)
                                </li>
                                <li>
                                    <strong>Veículo</strong> (texto)
                                </li>
                                <li>
                                    <strong>Status OS</strong> (lista)
                                </li>
                                <li>
                                    <strong>Número OS</strong> (texto)
                                </li>
                            </ul>

                            <h3>3. Anotar IDs dos Campos</h3>
                            <p>
                                Após criar os campos, anote os IDs de cada um. Você precisará
                                atualizar esses IDs no código da integração.
                            </p>

                            <h3>4. Conectar</h3>
                            <p>
                                Após salvar a configuração nesta página, clique em "Conectar com
                                Kommo" para autorizar a integração.
                            </p>

                            <h3>Links Úteis</h3>
                            <ul>
                                <li>
                                    <a
                                        href="https://www.amocrm.com/developers/content/crm_platform/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Documentação API Kommo
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.amocrm.com/developers/content/oauth/step-by-step"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Guia OAuth
                                    </a>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
