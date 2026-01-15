import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Rocket, Construction, Gauge, TrendingUp, Wrench } from "lucide-react";

const Performance = () => {
  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-6 flex flex-col items-center justify-center pb-24">
        <div className="text-center max-w-sm">
          {/* Animated Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Rocket className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <Construction className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Performance
          </h1>
          <p className="text-muted-foreground mb-8">
            Em breve você poderá acompanhar a performance do seu veículo aqui! 🚗💨
          </p>

          {/* Coming Soon Features */}
          <div className="space-y-3">
            <div className="glass-card rounded-xl p-4 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Indicadores de Saúde</p>
                <p className="text-xs text-muted-foreground">Status do seu veículo em tempo real</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Histórico de Manutenções</p>
                <p className="text-xs text-muted-foreground">Acompanhe a evolução do seu carro</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Próximas Revisões</p>
                <p className="text-xs text-muted-foreground">Alertas preventivos personalizados</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            🔧 Estamos trabalhando nisso!
          </p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Performance;
