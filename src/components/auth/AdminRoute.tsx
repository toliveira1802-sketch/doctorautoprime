import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

// DESENVOLVIMENTO: Proteção desabilitada - acesso livre para admin/gestão
export function AdminRoute({ children }: AdminRouteProps) {
  return <>{children}</>;
}
