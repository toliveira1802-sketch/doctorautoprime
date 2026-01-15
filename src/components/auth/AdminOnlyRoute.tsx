import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

// This route is for GESTÃO only (highest level) - renamed from AdminOnlyRoute for clarity
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const { isGestao, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Only gestão (highest level) can access these routes
  if (!isGestao) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
