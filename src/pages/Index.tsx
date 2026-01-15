import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ActionButtons } from "@/components/home/ActionButtons";
import { MyVehiclesSection } from "@/components/home/MyVehiclesSection";
import { Youtube, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
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
          // Get first name only
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

        {/* My Vehicles - only shows if vehicle is in service */}
        <MyVehiclesSection />

        {/* Action Buttons */}
        <section className="mt-4">
          <ActionButtons />
        </section>

        {/* Social Links */}
        <section className="py-6 mt-auto">
          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/doctorauto.prime?igsh=ejRheXE2dzB2NGo%3D&utm_source=qr"
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
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
