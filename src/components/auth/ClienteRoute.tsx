import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface ClienteRouteProps {
    children: ReactNode;
}

export const ClienteRoute = ({ children }: ClienteRouteProps) => {
    const { role, isLoading } = useUserRole();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    // Allow access for: cliente, vendedor (consultor), gestao, dev, master, admin
    const allowedRoles = ["cliente", "vendedor", "gestao", "dev", "master", "admin"];

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};
