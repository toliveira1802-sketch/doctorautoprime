/**
 * Botão para sincronizar OS com Kommo
 * Pode ser usado em detalhes da OS ou no card do Pátio
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useKommo } from '@/hooks/useKommo';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KommoSyncButtonProps {
    osId: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showLabel?: boolean;
}

export function KommoSyncButton({
    osId,
    variant = 'outline',
    size = 'sm',
    showLabel = true,
}: KommoSyncButtonProps) {
    const { isConnected, syncOS, syncing } = useKommo();
    const { toast } = useToast();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isConnected) {
        return null; // Não mostra botão se não está conectado
    }

    const handleSync = async () => {
        try {
            setStatus('idle');
            await syncOS(osId);
            setStatus('success');

            toast({
                title: 'Sincronizado com sucesso!',
                description: 'OS enviada para o Kommo CRM',
            });

            // Reset status após 3 segundos
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error: any) {
            setStatus('error');
            toast({
                title: 'Erro ao sincronizar',
                description: error.message,
                variant: 'destructive',
            });

            // Reset status após 5 segundos
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const getIcon = () => {
        if (syncing) return <Loader2 className="w-4 h-4 animate-spin" />;
        if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
        return <RefreshCw className="w-4 h-4" />;
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleSync}
            disabled={syncing}
            className="gap-2"
        >
            {getIcon()}
            {showLabel && (
                <span>
                    {syncing ? 'Sincronizando...' : status === 'success' ? 'Sincronizado' : 'Sync Kommo'}
                </span>
            )}
        </Button>
    );
}
