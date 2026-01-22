import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Settings, BarChart3 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export function ProfileSwitcher() {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasGestaoAccess, hasAdminAccess } = useUserRole();

    const getActiveTab = () => {
        if (location.pathname === "/" || location.pathname.startsWith("/cliente")) {
            return "cliente";
        }
        if (location.pathname.startsWith("/admin")) {
            return "admin";
        }
        if (location.pathname.startsWith("/gestao")) {
            return "gestao";
        }
        return "";
    };

    const activeTab = getActiveTab();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={activeTab === "cliente" ? "default" : "ghost"}
                size="sm"
                className={activeTab === "cliente" ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => navigate("/")}
            >
                <Home className="w-4 h-4 mr-2" />
                Cliente
            </Button>

            {/* Sempre exibir Admin (auth desabilitada) */}
            <Button
                variant={activeTab === "admin" ? "default" : "ghost"}
                size="sm"
                className={activeTab === "admin" ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => navigate("/admin")}
            >
                <Settings className="w-4 h-4 mr-2" />
                Admin
            </Button>

            {/* Sempre exibir Gestão (auth desabilitada) */}
            <Button
                variant={activeTab === "gestao" ? "default" : "ghost"}
                size="sm"
                className={activeTab === "gestao" ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => navigate("/gestao")}
            >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gestão
            </Button>
        </div>
    );
}
