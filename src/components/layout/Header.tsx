import { useNavigate } from "react-router-dom";
import { User, Crown, UserCog, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { ViewSwitcher } from "./ViewSwitcher";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

const roleConfig = {
  dev: { 
    label: "Dev", 
    color: "bg-black text-white",
    icon: Crown,
  },
  gestao: { 
    label: "Gestão", 
    color: "bg-blue-500 text-white", 
    icon: UserCog,
  },
  admin: { 
    label: "Admin", 
    color: "bg-orange-500 text-white", 
    icon: Shield,
  },
  user: { 
    label: "Cliente", 
    color: "bg-gray-500 text-white", 
    icon: User,
  },
};

// Componente especial da badge do Dev Corinthiano
function DevBadge() {
  return (
    <div className="relative group">
      {/* Badge com listras do Corinthians */}
      <div 
        className="relative overflow-hidden rounded-full px-3 py-1 flex items-center gap-1.5 border-2 border-black shadow-lg hover:scale-105 transition-transform cursor-default"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #000000,
            #000000 4px,
            #ffffff 4px,
            #ffffff 8px
          )`
        }}
      >
        {/* Overlay escuro para legibilidade */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Conteúdo */}
        <Crown className="h-3.5 w-3.5 text-white relative z-10 drop-shadow-lg" />
        <span className="text-xs font-bold text-white relative z-10 drop-shadow-lg tracking-wide">
          DEV
        </span>
        <span className="relative z-10 text-sm">🦅</span>
      </div>
      
      {/* Efeito de brilho animado */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
          animation: 'shimmer 2s infinite',
        }}
      />
      
      {/* Tooltip no hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        <span className="text-[10px] bg-black text-white px-2 py-1 rounded shadow-lg">
          Vai Corinthians! 🖤🤍
        </span>
      </div>
    </div>
  );
}

export function Header() {
  const navigate = useNavigate();
  const { role, isDev } = useUserRole();

  const currentRole = role ? roleConfig[role] : null;
  const RoleIcon = currentRole?.icon || User;

  return (
    <header className="sticky top-0 z-40 pt-safe-top">
      {/* CSS para animação de brilho */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo and Role */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Doctor Auto Prime" className="w-10 h-10 object-contain" />
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-lg text-foreground tracking-tight hidden sm:block">
                Doctor Auto Prime
              </h1>
              {currentRole && (
                isDev ? (
                  <DevBadge />
                ) : (
                  <Badge 
                    className={`${currentRole.color} text-xs px-2 py-0.5 flex items-center gap-1 w-fit`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {currentRole.label}
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* View Switcher */}
          <ViewSwitcher />

          {/* Profile Icon */}
          <button
            onClick={() => navigate("/profile")}
            className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Meu Perfil"
          >
            <User className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
