import { useNavigate } from "react-router-dom";
import { User, Crown, UserCog, Shield, MessageCircle } from "lucide-react";
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

// Escudo do Corinthians em SVG
function CorinthiansShield({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 120" 
      className={className}
      fill="none"
    >
      {/* Forma do escudo */}
      <path 
        d="M50 5 L95 20 L95 70 Q95 100 50 115 Q5 100 5 70 L5 20 Z" 
        fill="#000000" 
        stroke="#ffffff" 
        strokeWidth="3"
      />
      {/* Âncoras (símbolo náutico do Corinthians) */}
      <path 
        d="M50 25 L50 85 M35 40 L65 40 M30 75 Q50 90 70 75" 
        stroke="#ffffff" 
        strokeWidth="4" 
        strokeLinecap="round"
        fill="none"
      />
      {/* Detalhes da âncora */}
      <circle cx="50" cy="25" r="5" fill="#ffffff" />
      <path d="M35 80 L40 70 M65 80 L60 70" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Componente especial da badge do Dev Corinthiano
function DevBadge() {
  return (
    <div className="relative group">
      {/* Badge com listras do Corinthians */}
      <div 
        className="relative overflow-hidden rounded-full px-2.5 py-1 flex items-center gap-1.5 border-2 border-black shadow-lg hover:scale-105 transition-transform cursor-default"
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
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Escudo do Corinthians */}
        <CorinthiansShield className="h-5 w-4 relative z-10 drop-shadow-lg" />
        
        {/* Texto */}
        <span className="text-xs font-bold text-white relative z-10 drop-shadow-lg tracking-wide uppercase">
          Dev
        </span>
        
        {/* Águia */}
        <span className="relative z-10 text-sm">🦅</span>
      </div>
      
      {/* Efeito de brilho animado */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
          animation: 'shimmer 2s infinite',
        }}
      />
      
      {/* Tooltip no hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
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

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center hover:scale-105 transition-all"
              aria-label="Contato via WhatsApp"
            >
              <MessageCircle className="h-5 w-5 text-white" fill="white" />
            </a>

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
      </div>
    </header>
  );
}
