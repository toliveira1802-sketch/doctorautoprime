import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Calendar, Settings, LogOut, ChevronRight, Award, Crown, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { LoyaltyCard } from "@/components/profile/LoyaltyCard";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  birthday: string | null;
  loyalty_points: number;
  loyalty_level: string;
}

const loyaltyConfig = {
  bronze: { label: "Bronze", color: "bg-amber-700", nextLevel: "silver", pointsNeeded: 500, icon: Award },
  silver: { label: "Prata", color: "bg-slate-400", nextLevel: "gold", pointsNeeded: 1500, icon: Award },
  gold: { label: "Ouro", color: "bg-yellow-500", nextLevel: "platinum", pointsNeeded: 3000, icon: Award },
  platinum: { label: "Platinum", color: "bg-gradient-to-r from-slate-600 to-slate-400", nextLevel: null, pointsNeeded: null, icon: Crown },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone, cpf, avatar_url, birthday, loyalty_points, loyalty_level")
          .eq("user_id", authUser.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } else {
        // Mock data for demo
        setProfile({
          id: "1",
          full_name: user?.name || "João Silva",
          phone: user?.phone || "(11) 99999-9999",
          cpf: "***.***.***-00",
          avatar_url: null,
          birthday: "1990-05-15",
          loyalty_points: 750,
          loyalty_level: "silver",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Use mock data on error
      setProfile({
        id: "1",
        full_name: user?.name || "João Silva",
        phone: user?.phone || "(11) 99999-9999",
        cpf: "***.***.***-00",
        avatar_url: null,
        birthday: "1990-05-15",
        loyalty_points: 750,
        loyalty_level: "silver",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Você saiu da sua conta");
  };

  const getBirthdayInfo = () => {
    if (!profile?.birthday) return null;
    
    const today = new Date();
    const birthday = parseISO(profile.birthday);
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = differenceInDays(thisYearBirthday, today);
    const formattedDate = format(birthday, "dd 'de' MMMM", { locale: ptBR });
    
    return { daysUntil, formattedDate };
  };

  const birthdayInfo = getBirthdayInfo();
  const currentLoyalty = loyaltyConfig[profile?.loyalty_level as keyof typeof loyaltyConfig] || loyaltyConfig.bronze;
  const progressToNext = currentLoyalty.pointsNeeded 
    ? Math.min(((profile?.loyalty_points || 0) / currentLoyalty.pointsNeeded) * 100, 100)
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 gradient-primary opacity-90" />
        <div className="relative z-10 p-4 pt-12">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold text-white">Meu Perfil</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="mx-2 shadow-xl border-0 overflow-visible">
            <CardContent className="pt-0 pb-6 relative">
              <div className="flex flex-col items-center -mt-12">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl gradient-primary text-white">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-bold text-foreground">
                  {profile?.full_name || "Usuário"}
                </h2>
                <p className="text-muted-foreground">{profile?.phone}</p>

                {/* Loyalty Badge */}
                <Badge className={`mt-3 ${currentLoyalty.color} text-white px-4 py-1`}>
                  <currentLoyalty.icon className="h-4 w-4 mr-2" />
                  Cliente {currentLoyalty.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Birthday Card */}
        {birthdayInfo && (
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Aniversário</p>
                <p className="text-sm text-muted-foreground">{birthdayInfo.formattedDate}</p>
              </div>
              {birthdayInfo.daysUntil <= 30 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {birthdayInfo.daysUntil === 0 ? "🎉 Hoje!" : `${birthdayInfo.daysUntil} dias`}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loyalty Card */}
        <LoyaltyCard 
          points={profile?.loyalty_points || 0}
          level={profile?.loyalty_level || "bronze"}
          progress={progressToNext}
        />

        <Separator className="my-6" />

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuOption 
            icon={Calendar} 
            label="Meus Agendamentos" 
            onClick={() => navigate("/agenda")}
          />
          <MenuOption 
            icon={Gift} 
            label="Ofertas Exclusivas" 
            badge="3"
            onClick={() => toast.info("Em breve!")}
          />
          <MenuOption 
            icon={Settings} 
            label="Configurações" 
            onClick={() => toast.info("Em breve!")}
          />
          <MenuOption 
            icon={LogOut} 
            label="Sair" 
            variant="danger"
            onClick={handleLogout}
          />
        </div>
      </div>

      <BottomNavigation />

      <EditProfileDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onSave={fetchProfile}
      />
    </div>
  );
}

interface MenuOptionProps {
  icon: React.ElementType;
  label: string;
  badge?: string;
  variant?: "default" | "danger";
  onClick: () => void;
}

function MenuOption({ icon: Icon, label, badge, variant = "default", onClick }: MenuOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
        variant === "danger" 
          ? "text-destructive hover:bg-destructive/10" 
          : "hover:bg-muted"
      }`}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        variant === "danger" ? "bg-destructive/10" : "bg-muted"
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <Badge className="bg-primary text-white">{badge}</Badge>
      )}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
