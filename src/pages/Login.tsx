import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';
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
    const redirectTo = localStorage.getItem('drprime_redirect') || '/';
    localStorage.removeItem('drprime_redirect');
    navigate(redirectTo);
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
          <img src={logo} alt="Doctor Auto Prime" className="w-24 h-24 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Doctor Auto Prime
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
            <button 
              onClick={() => navigate('/register')}
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </p>
        </div>

        {/* Test Credentials - DEV ONLY */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
          <p className="text-xs text-muted-foreground text-center mb-2 font-semibold">
            🧪 Credenciais de Teste
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium">Admin:</span> admin@doctorautoprime.com / admin123</p>
            <p><span className="font-medium">Cliente:</span> cliente@teste.com / cliente123</p>
          </div>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default Login;
