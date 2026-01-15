import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ActionButtons } from "@/components/home/ActionButtons";
import { MyVehiclesSection } from "@/components/home/MyVehiclesSection";
import { Youtube, Instagram, BookOpen, Construction } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const handleBlogClick = () => {
    toast.info("Blog em construção! 🚧", {
      description: "Em breve teremos conteúdos exclusivos para você.",
    });
  };

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
          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/doctorauto.prime/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Instagram className="h-6 w-6 text-white" />
            </a>
            <a
              href="https://www.youtube.com/@PerformanceDoctorAuto/shorts"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Youtube className="h-6 w-6 text-white" />
            </a>
            <button
              onClick={handleBlogClick}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative"
            >
              <BookOpen className="h-6 w-6 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <Construction className="h-2.5 w-2.5 text-white" />
              </span>
            </button>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
