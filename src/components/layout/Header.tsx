import { Bell, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 pt-safe-top">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground tracking-tight">
                Dr. Prime
              </h1>
              <p className="text-xs text-muted-foreground">Auto Cuidado</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors touch-target">
              <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              {/* Notification badge */}
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors touch-target">
              <Settings className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
