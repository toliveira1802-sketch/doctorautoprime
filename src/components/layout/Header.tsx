import { useNavigate } from "react-router-dom";
import { User, Crown, UserCog, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { ViewSwitcher } from "./ViewSwitcher";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

const roleConfig = {
  dev: { 
    label: "Dev 🖤🤍", 
    color: "bg-gradient-to-r from-black to-white text-black", 
    icon: Crown,
    emoji: "⚫⚪"
  },
  gestao: { 
    label: "Gestão", 
    color: "bg-blue-500 text-white", 
    icon: UserCog,
    emoji: ""
  },
  admin: { 
    label: "Admin", 
    color: "bg-orange-500 text-white", 
    icon: Shield,
    emoji: ""
  },
  user: { 
    label: "Cliente", 
    color: "bg-gray-500 text-white", 
    icon: User,
    emoji: ""
  },
};

export function Header() {
  const navigate = useNavigate();
  const { role, isDev } = useUserRole();

  const currentRole = role ? roleConfig[role] : null;
  const RoleIcon = currentRole?.icon || User;

  return (
    <header className="sticky top-0 z-40 pt-safe-top">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo and Role */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Doctor Auto Prime" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <h1 className="font-bold text-lg text-foreground tracking-tight hidden sm:block">
                Doctor Auto Prime
              </h1>
              {currentRole && (
                <Badge 
                  className={`${currentRole.color} text-xs px-2 py-0.5 flex items-center gap-1 w-fit ${isDev ? 'animate-pulse' : ''}`}
                >
                  <RoleIcon className="h-3 w-3" />
                  {currentRole.label}
                  {isDev && <span className="ml-1">🦅</span>}
                </Badge>
              )}
            </div>
          </div>

          {/* View Switcher - Only for thales */}
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
