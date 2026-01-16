import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<string | null>(null);

  // Capture referral code and invite code from URL on mount
  useEffect(() => {
    const ref = searchParams.get('ref');
    const invite = searchParams.get('invite');
    
    if (ref) {
      setReferralCode(ref.toUpperCase());
      console.log('Referral code captured:', ref);
    }
    
    if (invite) {
      setInviteCode(invite.toUpperCase());
      // Validate invite code
      const validateInvite = async () => {
        const { data, error } = await supabase
          .from('invites')
          .select('code, role')
          .eq('code', invite.toUpperCase())
          .is('used_by', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
        
        if (data && !error) {
          setInviteRole(data.role);
          toast.success(`Convite válido para ${data.role === 'admin' ? 'Administrador' : data.role === 'gestao' ? 'Gestão' : 'Usuário'}`);
        } else {
          toast.error('Código de convite inválido ou expirado');
          setInviteCode(null);
        }
      };
      validateInvite();
    }
  }, [searchParams]);

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

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // 1. Sign up the user
    const { error: signUpError } = await signUp(formData.email, formData.password, formData.name);
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
      setIsSubmitting(false);
      return;
    }

    // 2. Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Get the current user to create the vehicle
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Use invite code if present
      if (inviteCode) {
        const { data: inviteUsed, error: inviteError } = await supabase.rpc('use_invite', {
          invite_code: inviteCode
        });

        if (inviteError) {
          console.error('Error using invite:', inviteError);
        } else if (inviteUsed) {
          console.log('Invite used successfully, role assigned');
          toast.success(`Você foi cadastrado como ${inviteRole === 'admin' ? 'Administrador' : inviteRole === 'gestao' ? 'Gestão' : 'Usuário'}!`);
        }
      }

      // Save referral source if present (for lead tracking)
      if (referralCode) {
        const { error: referralError } = await supabase
          .from('profiles')
          .update({ referral_source: referralCode })
          .eq('user_id', user.id);

        if (referralError) {
          console.error('Error saving referral source:', referralError);
        } else {
          console.log('Referral source saved:', referralCode);
        }
      }
    }

    toast.success('Conta criada com sucesso!');
    
    // Redirect based on role
    if (inviteRole === 'admin') {
      navigate('/admin');
    } else if (inviteRole === 'gestao') {
      navigate('/gestao');
    } else {
      navigate('/');
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = formData.name.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

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
      <div className="relative flex-1 flex flex-col px-6 py-4 overflow-y-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src={logo} alt="Doctor Auto Prime" className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Crie sua conta
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha seus dados para começar
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 flex-1">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium text-sm">
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
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-sm animate-fade-in">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium text-sm">
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
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium text-sm">
              Senha
            </Label>
            <div className={cn(
              'glass-card flex items-center gap-3 px-4 transition-all duration-300',
              errors.password && 'ring-2 ring-destructive/50'
            )}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm animate-fade-in">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">
              Confirmar senha
            </Label>
            <div className={cn(
              'glass-card flex items-center gap-3 px-4 transition-all duration-300',
              errors.confirmPassword && 'ring-2 ring-destructive/50'
            )}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repita a senha"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm animate-fade-in">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 pb-2">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg group"
          >
            {isSubmitting ? (
              'Criando conta...'
            ) : (
              <>
                Criar conta
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
