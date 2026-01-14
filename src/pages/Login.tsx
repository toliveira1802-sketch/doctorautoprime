import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/auth/PhoneInput';
import BiometricPrompt from '@/components/auth/BiometricPrompt';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, biometricEnabled } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  // Check if biometric is enabled on mount
  React.useEffect(() => {
    if (biometricEnabled) {
      setShowBiometric(true);
    }
  }, [biometricEnabled]);

  const isValidPhone = phone.replace(/\D/g, '').length === 11;

  const handleContinue = () => {
    if (!isValidPhone) {
      setError(true);
      return;
    }
    setError(false);
    login(phone);
    navigate('/verify-otp');
  };

  const handleBiometricSuccess = () => {
    setShowBiometric(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Biometric Prompt */}
      <BiometricPrompt
        isOpen={showBiometric}
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
      />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 red-glow mb-6">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dr. Prime
          </h1>
          <p className="text-muted-foreground">
            Seu veículo em boas mãos
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Entre na sua conta
            </h2>
            <p className="text-muted-foreground text-sm">
              Digite seu número de celular para continuar
            </p>
          </div>

          <PhoneInput
            value={phone}
            onChange={(value) => {
              setPhone(value);
              setError(false);
            }}
            error={error}
          />

          {error && (
            <p className="text-destructive text-sm text-center">
              Digite um número de celular válido
            </p>
          )}

          <Button
            onClick={handleContinue}
            disabled={!isValidPhone}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg group"
          >
            Continuar
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {biometricEnabled && (
            <Button
              variant="outline"
              onClick={() => setShowBiometric(true)}
              className="w-full border-primary/30 text-primary hover:bg-primary/10 py-6"
            >
              Entrar com biometria
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Primeiro acesso?{' '}
            <button className="text-primary hover:underline font-medium">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default Login;
