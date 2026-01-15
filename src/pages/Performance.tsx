import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Zap, Construction } from "lucide-react";

const Performance = () => {
  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-6 flex flex-col items-center justify-center pb-24">
        <div className="text-center max-w-sm">
          {/* Animated Icon */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <span className="text-6xl">🚧</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Performance & Remap
          </h1>
          <p className="text-muted-foreground mb-6">
            Área exclusiva para serviços de performance e remap do seu veículo
          </p>

          {/* Coming Soon */}
          <div className="glass-card rounded-xl p-6 opacity-80">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Construction className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-foreground">Em breve!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Estamos preparando algo especial para turbinar seu carro. Aguarde novidades!
            </p>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            ⚡ Mais potência em breve
          </p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Performance;
