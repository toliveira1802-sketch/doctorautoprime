import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import logo from "@/assets/logo.png";
import { ViewSwitcher } from "./ViewSwitcher";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 pt-safe-top">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Doctor Auto Prime" className="w-10 h-10 object-contain" />
            <h1 className="font-bold text-lg text-foreground tracking-tight hidden sm:block">
              Doctor Auto Prime
            </h1>
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
