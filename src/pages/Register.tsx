import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, CreditCard, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  email: string;
  plate: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  plate?: string;
}

const formatPlate = (value: string): string => {
  // Remove non-alphanumeric and convert to uppercase
  const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Format as ABC-1234 or ABC1D23 (Mercosul)
  if (clean.length <= 3) {
    return clean;
  } else if (clean.length <= 7) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    plate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    const plateClean = formData.plate.replace(/[^A-Za-z0-9]/g, '');
    if (!plateClean) {
      newErrors.plate = 'Placa é obrigatória';
    } else if (plateClean.length !== 7) {
      newErrors.plate = 'Placa deve ter 7 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Store registration data temporarily
    localStorage.setItem('drprime_registration', JSON.stringify(formData));
    
    // Navigate to login to complete phone verification
    navigate('/login');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    if (field === 'plate') {
      processedValue = formatPlate(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = formData.name.trim().length >= 3 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.plate.replace(/[^A-Za-z0-9]/g, '').length === 7;

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
      <div className="relative flex-1 flex flex-col px-6 py-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Doctor Auto Prime" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Crie sua conta
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha seus dados para começar
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5 flex-1">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Nome completo
            </Label>
            <div className={cn(
              'glass-card flex items-center gap-3 px-4 transition-all duration-300',
              errors.name && 'ring-2 ring-destructive/50'
            )}>
              <User className="w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Seu nome"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-sm animate-fade-in">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email
            </Label>
            <div className={cn(
              'glass-card flex items-center gap-3 px-4 transition-all duration-300',
              errors.email && 'ring-2 ring-destructive/50'
            )}>
              <Mail className="w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* Plate Field */}
          <div className="space-y-2">
            <Label htmlFor="plate" className="text-foreground font-medium">
              Placa do veículo
            </Label>
            <div className={cn(
              'glass-card flex items-center gap-3 px-4 transition-all duration-300',
              errors.plate && 'ring-2 ring-destructive/50'
            )}>
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <Input
                id="plate"
                type="text"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value)}
                placeholder="ABC-1234"
                maxLength={8}
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6 uppercase"
              />
            </div>
            {errors.plate && (
              <p className="text-destructive text-sm animate-fade-in">{errors.plate}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Formatos aceitos: ABC-1234 ou ABC1D23
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 pb-4">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg group"
          >
            {isSubmitting ? (
              'Criando conta...'
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-muted-foreground text-sm">
            Já tem conta?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default Register;
