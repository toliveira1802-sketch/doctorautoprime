import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

// TEMPORARILY DISABLED - Role checking disabled for development
// This route is for DEV and GESTÃO only (highest levels) - can manage roles
// To re-enable, uncomment the role verification logic below
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  // const { hasGestaoAccess, isLoading } = useUserRole();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
  //         <p className="text-muted-foreground">Verificando permissões...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // Only dev and gestão (highest levels) can access these routes
  // if (!hasGestaoAccess) {
  //   return <Navigate to="/admin" replace />;
  // }

  return <>{children}</>;
}
