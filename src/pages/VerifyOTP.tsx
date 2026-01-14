import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const phone = localStorage.getItem('drprime_pending_phone') || '(11) 99999-9999';

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(false);

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = verifyOTP(otp);
    
    if (success) {
      navigate('/biometric-setup');
    } else {
      setError(true);
      setOtp('');
    }
    
    setIsVerifying(false);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setError(false);
    setOtp('');
    // Show toast or feedback
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative px-4 py-6">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verificação
          </h1>
          <p className="text-muted-foreground">
            Enviamos um código para
          </p>
          <p className="text-primary font-semibold mt-1">
            {phone}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center mb-8">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            disabled={isVerifying}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={`
                    w-12 h-14 text-xl font-bold rounded-xl border-2
                    bg-card text-foreground
                    ${error ? 'border-destructive' : 'border-border'}
                    ${otp[index] ? 'border-primary' : ''}
                    focus:border-primary focus:ring-2 focus:ring-primary/30
                  `}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-destructive text-sm text-center mb-4 animate-fade-in">
            Código inválido. Tente novamente.
          </p>
        )}

        {/* Timer / Resend */}
        <div className="text-center mb-8">
          {canResend ? (
            <Button
              variant="ghost"
              onClick={handleResend}
              className="text-primary hover:text-primary/80"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reenviar código
            </Button>
          ) : (
            <p className="text-muted-foreground text-sm">
              Reenviar código em{' '}
              <span className="text-primary font-mono font-semibold">
                {formatTime(timer)}
              </span>
            </p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
        >
          {isVerifying ? 'Verificando...' : 'Verificar'}
        </Button>
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default VerifyOTP;
