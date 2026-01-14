import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { ServiceTimeline } from "@/components/service/ServiceTimeline";
import { QuickActions } from "@/components/home/QuickActions";
import vehicleImage from "@/assets/vehicle-suv.jpg";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg dark">
      <Header />

      <main className="px-4 pb-28 pt-6 space-y-6">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Olá, Carlos! 👋
          </h2>
          <p className="text-muted-foreground">
            Seu veículo está sendo cuidado agora.
          </p>
        </section>

        {/* Quick Actions */}
        <section>
          <QuickActions />
        </section>

        {/* Active Vehicle */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Veículo Ativo
            </h3>
            <button className="text-sm text-primary hover:underline">
              Ver todos
            </button>
          </div>
          <VehicleCard
            brand="Honda"
            model="HR-V"
            year={2022}
            plate="ABC-1D23"
            status="diagnosis"
            nextService="5.000 km"
            imageUrl={vehicleImage}
          />
        </section>

        {/* Service Timeline */}
        <section>
          <ServiceTimeline />
        </section>

        {/* Chatbot Floating Button */}
        <button className="fixed right-4 bottom-28 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center animate-bounce-subtle z-40 hover:scale-110 transition-transform">
          <span className="text-2xl">🤖</span>
        </button>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
