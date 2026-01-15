import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ActionButtons } from "@/components/home/ActionButtons";
import { MyVehiclesSection } from "@/components/home/MyVehiclesSection";
import { Youtube, Instagram, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="h-screen gradient-bg dark flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-6 flex flex-col">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Olá, Carlos! 👋
          </h2>
        </section>

        {/* My Vehicles - only shows if vehicle is in service */}
        <MyVehiclesSection />

        {/* Action Buttons */}
        <section className="flex-1 mt-4">
          <ActionButtons />
        </section>

        {/* Social Links */}
        <section className="py-4">
          <div className="flex justify-center gap-6">
            <a
              href="https://blog.doctorauto.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs">Blog</span>
            </a>
            <a
              href="https://youtube.com/@doctorauto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Youtube className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs">YouTube</span>
            </a>
            <a
              href="https://instagram.com/doctorauto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs">Instagram</span>
            </a>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
