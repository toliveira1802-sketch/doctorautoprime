import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ActionButtons } from "@/components/home/ActionButtons";
import { MyVehiclesSection } from "@/components/home/MyVehiclesSection";
import { Youtube, Instagram, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// TikTok icon component (Lucide doesn't have one)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();
        
        if (profile?.full_name) {
          const firstName = profile.full_name.split(" ")[0];
          setUserName(firstName);
        }
      }
    };
    fetchUserName();
  }, []);


  return (
    <div className="min-h-screen gradient-bg dark flex flex-col">
      <Header />

      <main className="flex-1 px-4 pt-6 pb-24 flex flex-col">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Olá, {userName || "..."} 👋
          </h2>
        </section>

        {/* My Vehicles */}
        <MyVehiclesSection />

        {/* Action Buttons */}
        <section className="mt-4">
          <ActionButtons />
        </section>

        {/* Social Links */}
        <section className="py-6 mt-auto">
          <div className="flex justify-between px-4">
            <a
              href="https://www.instagram.com/doctorauto.prime?igsh=ejRheXE2dzB2NGo%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Instagram className="h-5 w-5 text-white" />
            </a>
            <a
              href="https://www.youtube.com/@PerformanceDoctorAuto/shorts"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Youtube className="h-5 w-5 text-white" />
            </a>
            <a
              href="https://www.tiktok.com/@doctorauto.prime"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <TikTokIcon className="h-5 w-5 text-white" />
            </a>
            <button
              onClick={() => navigate("/blog")}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <BookOpen className="h-5 w-5 text-white" />
            </button>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
