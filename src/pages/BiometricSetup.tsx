import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const BiometricSetup: React.FC = () => {
  const navigate = useNavigate();
  const { enableBiometric, skipBiometric } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    
    // Simulate biometric activation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSuccess(true);
    enableBiometric();
    
    // Navigate after success animation
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleSkip = () => {
    skipBiometric();
    navigate('/');
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div 
            className={`
              w-32 h-32 rounded-full flex items-center justify-center
              transition-all duration-500
              ${isSuccess 
                ? 'bg-success/20 text-success' 
                : 'bg-primary/20 text-primary status-pulse'
              }
            `}
          >
            {isSuccess ? (
              <Shield className="w-16 h-16 animate-scale-in" />
            ) : (
              <Fingerprint className={`w-16 h-16 ${isActivating ? 'animate-pulse' : ''}`} />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {isSuccess ? 'Biometria Ativada!' : 'Acesso Rápido'}
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {isSuccess 
              ? 'Agora você pode entrar usando sua biometria'
              : 'Use sua digital para entrar mais rápido da próxima vez'
            }
          </p>
        </div>

        {/* Features */}
        {!isSuccess && !isActivating && (
          <div className="glass-card p-4 mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">Seguro e privado</p>
                <p className="text-muted-foreground text-xs">Seus dados biométricos nunca saem do dispositivo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">Login instantâneo</p>
                <p className="text-muted-foreground text-xs">Entre sem precisar digitar códigos</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isSuccess && (
          <div className="space-y-4">
            <Button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
            >
              {isActivating ? (
                <>
                  <Fingerprint className="w-5 h-5 mr-2 animate-pulse" />
                  Ativando...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 mr-2" />
                  Ativar Biometria
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isActivating}
              className="w-full text-muted-foreground hover:text-foreground py-6"
            >
              Configurar depois
            </Button>
          </div>
        )}

        {isSuccess && (
          <div className="text-center">
            <p className="text-muted-foreground text-sm animate-fade-in">
              Redirecionando...
            </p>
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default BiometricSetup;
