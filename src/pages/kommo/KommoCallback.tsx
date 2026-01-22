/**
 * Página de callback OAuth do Kommo
 * Recebe o código de autorização e troca por tokens
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKommo } from '@/hooks/useKommo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KommoCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { config, saveTokens } = useKommo();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            // Extrai código da URL
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (!code) {
                throw new Error('Código de autorização não encontrado');
            }

            if (!config) {
                throw new Error('Configuração Kommo não encontrada');
            }

            // Troca código por tokens
            const response = await fetch(
                `https://${config.subdomain}.kommo.com/oauth2/access_token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: config.client_id,
                        client_secret: config.client_secret,
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: config.redirect_uri,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.hint || 'Erro ao obter tokens');
            }

            const data = await response.json();

            // Salva tokens no banco
            await saveTokens(data.access_token, data.refresh_token);

            setStatus('success');

            // Redireciona após 2 segundos
            setTimeout(() => {
                navigate('/gestao/integracoes/kommo');
            }, 2000);
        } catch (err: any) {
            console.error('Erro no callback OAuth:', err);
            setError(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        {status === 'loading' && 'Conectando ao Kommo...'}
                        {status === 'success' && 'Conectado com Sucesso!'}
                        {status === 'error' && 'Erro na Conexão'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {status === 'loading' && 'Aguarde enquanto processamos sua autorização'}
                        {status === 'success' && 'Redirecionando para configurações...'}
                        {status === 'error' && 'Ocorreu um erro ao conectar com o Kommo'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {status === 'loading' && (
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                            <p className="text-center text-sm text-muted-foreground">
                                Sua conta Kommo foi conectada com sucesso! Agora você pode sincronizar
                                suas Ordens de Serviço automaticamente.
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-16 h-16 text-red-500" />
                            <div className="w-full space-y-3">
                                <p className="text-center text-sm text-red-600">{error}</p>
                                <Button
                                    onClick={() => navigate('/gestao/integracoes/kommo')}
                                    className="w-full"
                                >
                                    Voltar para Configurações
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
