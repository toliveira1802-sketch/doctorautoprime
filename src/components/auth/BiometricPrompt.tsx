import React, { useState } from 'react';
import { Fingerprint, ScanFace, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BiometricPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type?: 'fingerprint' | 'face';
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type = 'fingerprint',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate biometric scan
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 500);
    }, 1500);
  };

  if (!isOpen) return null;

  const Icon = type === 'fingerprint' ? Fingerprint : ScanFace;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card p-8 mx-4 max-w-sm w-full text-center animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div 
          className={cn(
            'mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300',
            isSuccess 
              ? 'bg-success/20 text-success' 
              : 'bg-primary/20 text-primary',
            isScanning && 'status-pulse'
          )}
          onClick={handleScan}
        >
          <Icon className={cn(
            'w-12 h-12 transition-transform duration-300',
            isScanning && 'scale-110'
          )} />
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {isSuccess ? 'Autenticado!' : type === 'fingerprint' ? 'Toque no sensor' : 'Olhe para a câmera'}
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          {isSuccess 
            ? 'Biometria verificada com sucesso'
            : 'Confirme sua identidade para continuar'
          }
        </p>

        {/* Actions */}
        {!isSuccess && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full gradient-primary text-primary-foreground font-semibold py-6"
            >
              {isScanning ? 'Verificando...' : 'Simular Biometria'}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground"
            >
              Usar código SMS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricPrompt;
