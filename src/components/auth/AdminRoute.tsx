import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminRouteProps {
  children: React.ReactNode;
}

// TEMPORARILY DISABLED - Role checking disabled for development
// To re-enable, uncomment the role verification logic below
export function AdminRoute({ children }: AdminRouteProps) {
  // const { hasAdminAccess, isLoading } = useUserRole();

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

  // if (!hasAdminAccess) {
  //   return <Navigate to="/" replace />;
  // }

  return <>{children}</>;
}
