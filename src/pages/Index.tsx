import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ActionButtons } from "@/components/home/ActionButtons";

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

        {/* Action Buttons */}
        <section>
          <ActionButtons />
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
