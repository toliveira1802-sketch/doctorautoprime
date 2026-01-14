import { Bell, User } from "lucide-react";
import logo from "@/assets/logo.png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 pt-safe-top">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Doctor Auto Prime" className="w-10 h-10 object-contain" />
            <h1 className="font-bold text-lg text-foreground tracking-tight">
              Doctor Auto Prime
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors touch-target">
              <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              {/* Notification badge */}
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors touch-target">
              <User className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
