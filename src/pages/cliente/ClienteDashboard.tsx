import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Car,
    Bell,
    Gift,
    ChevronRight,
    Home,
    Calendar,
    History,
    TrendingUp,
    Instagram,
    Youtube,
    Music,
    BookOpen,
    User,
} from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
    id: string;
    plate: string;
    model: string;
    brand: string;
}

interface Reminder {
    id: string;
    title: string;
    description: string;
    date: string;
}

export default function ClienteDashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("...");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [activeTab, setActiveTab] = useState("home");

    useEffect(() => {
        fetchUserData();
        fetchVehicles();
        fetchReminders();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                if (profile?.full_name) {
                    setUserName(profile.full_name.split(" ")[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const fetchVehicles = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("ordens_servico")
                .select("vehicle, plate")
                .eq("client_phone", user.phone || "")
                .limit(5);

            if (error) throw error;

            // Group by plate to avoid duplicates
            const uniqueVehicles = data?.reduce((acc: Vehicle[], curr) => {
                if (!acc.find(v => v.plate === curr.plate)) {
                    const [brand, ...modelParts] = (curr.vehicle || "").split(" ");
                    acc.push({
                        id: curr.plate,
                        plate: curr.plate || "",
                        brand: brand || "",
                        model: modelParts.join(" ") || "",
                    });
                }
                return acc;
            }, []) || [];

            setVehicles(uniqueVehicles);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    };

    const fetchReminders = async () => {
        // Mock data for now - can be connected to real reminders later
        setReminders([]);
    };

    const handleVehicleClick = (vehicleId: string) => {
        navigate(`/veiculo/${vehicleId}`);
    };

    const handleSocialClick = (platform: string) => {
        const urls = {
            instagram: "https://instagram.com/doctorautoprime",
            youtube: "https://youtube.com/@doctorautoprime",
            tiktok: "https://tiktok.com/@doctorautoprime",
            blog: "/blog",
        };

        if (platform === "blog") {
            navigate("/blog");
        } else {
            window.open(urls[platform as keyof typeof urls], "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6" />
                    </div>
                    <h1 className="text-lg font-bold">Doctor Auto Prime</h1>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={activeTab === "cliente" ? "default" : "ghost"}
                        size="sm"
                        className={activeTab === "cliente" ? "bg-red-600 hover:bg-red-700" : ""}
                        onClick={() => setActiveTab("cliente")}
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Cliente
                    </Button>
                    <Button
                        variant={activeTab === "admin" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => navigate("/admin")}
                    >
                        Admin
                    </Button>
                    <Button
                        variant={activeTab === "gestao" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => navigate("/gestao")}
                    >
                        Gestão
                    </Button>
                </div>

                <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
                    <User className="w-5 h-5" />
                </Button>
            </header>

            {/* Main Content */}
            <main className="p-4 pb-24 max-w-2xl mx-auto">
                {/* Greeting */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-1">
                        Olá, {userName} 👋
                    </h2>
                </div>

                {/* Meus Veículos */}
                <Card
                    className="bg-[#111] border-gray-800 p-4 mb-4 cursor-pointer hover:bg-[#151515] transition-colors"
                    onClick={() => vehicles.length > 0 && handleVehicleClick(vehicles[0].id)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                                <Car className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">MEUS VEÍCULOS</h3>
                                <p className="text-sm text-gray-400">
                                    {vehicles.length > 0 ? `${vehicles.length} veículo(s)` : "Nenhum veículo"}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Card>

                {/* Lembretes */}
                <Card
                    className="bg-[#111] border-gray-800 p-4 mb-4 cursor-pointer hover:bg-[#151515] transition-colors"
                    onClick={() => navigate("/agenda")}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                                <Bell className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Lembretes</h3>
                                <p className="text-sm text-gray-400">
                                    {reminders.length > 0 ? `${reminders.length} pendente(s)` : "Nenhum pendente"}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Card>

                {/* Promoções */}
                <Card
                    className="bg-[#111] border-gray-800 p-4 mb-6 cursor-pointer hover:bg-[#151515] transition-colors"
                    onClick={() => navigate("/blog")}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                                <Gift className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Promoções</h3>
                                <p className="text-sm text-gray-400">Aguarde novidades</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Card>

                {/* Social Media Links */}
                <div className="grid grid-cols-4 gap-3">
                    <button
                        onClick={() => handleSocialClick("instagram")}
                        className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Instagram className="w-8 h-8" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                    </button>

                    <button
                        onClick={() => handleSocialClick("youtube")}
                        className="relative bg-red-600 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Youtube className="w-8 h-8" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                    </button>

                    <button
                        onClick={() => handleSocialClick("tiktok")}
                        className="relative bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Music className="w-8 h-8" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                    </button>

                    <button
                        onClick={() => handleSocialClick("blog")}
                        className="relative bg-orange-600 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <BookOpen className="w-8 h-8" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                    </button>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 px-4 py-3">
                <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
                    <Button
                        variant="ghost"
                        className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === "home" ? "text-red-500" : "text-gray-400"
                            }`}
                        onClick={() => setActiveTab("home")}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-xs">Home</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
                        onClick={() => navigate("/agenda")}
                    >
                        <Calendar className="w-5 h-5" />
                        <span className="text-xs">Agenda</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
                        onClick={() => navigate("/historico")}
                    >
                        <History className="w-5 h-5" />
                        <span className="text-xs">Histórico</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
                        onClick={() => navigate("/performance")}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-xs">Performance</span>
                    </Button>
                </div>
            </nav>
        </div>
    );
}
