import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This page is no longer needed with email/password auth
// Keeping it as a placeholder that redirects to home
const BiometricSetup: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to home since biometric setup is no longer in the flow
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Redirecionando...</h1>
        <p className="text-muted-foreground mb-6">Você será redirecionado para a página inicial</p>
        <Button onClick={() => navigate('/')}>Ir para Home</Button>
      </div>
    </div>
  );
};

export default BiometricSetup;
