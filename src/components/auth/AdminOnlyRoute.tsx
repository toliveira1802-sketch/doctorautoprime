import { ReactNode } from "react";

interface AdminOnlyRouteProps {
  children: ReactNode;
}

// DESENVOLVIMENTO: Proteção desabilitada - acesso livre para gestão
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  return <>{children}</>;
}
