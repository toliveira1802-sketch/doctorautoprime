import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AdminOnlyRoute } from "./components/auth/AdminOnlyRoute";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import BiometricSetup from "./pages/BiometricSetup";
import Agenda from "./pages/Agenda";
import Avisos from "./pages/Avisos";
import Performance from "./pages/Performance";
import NovoAgendamento from "./pages/NovoAgendamento";
import AgendamentoSucesso from "./pages/AgendamentoSucesso";
import Reagendamento from "./pages/Reagendamento";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";

import AdminOrdensServico from "./pages/admin/AdminOrdensServico";
import AdminNovaOS from "./pages/admin/AdminNovaOS";
import AdminOSDetalhes from "./pages/admin/AdminOSDetalhes";
import AdminPatioDetalhes from "./pages/admin/AdminPatioDetalhes";
import AdminPatio from "./pages/admin/AdminPatio";
import AdminMechanicFeedback from "./pages/admin/AdminMechanicFeedback";
import AdminMechanicAnalytics from "./pages/admin/AdminMechanicAnalytics";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminServicos from "./pages/admin/AdminServicos";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminDocumentacao from "./pages/admin/AdminDocumentacao";
import ServicoDetalhes from "./pages/ServicoDetalhes";
import OrcamentoCliente from "./pages/OrcamentoCliente";
import VehicleDetails from "./pages/VehicleDetails";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import GestaoDashboards from "./pages/gestao/GestaoDashboards";
import GestaoDashboardView from "./pages/gestao/GestaoDashboardView";
import GestaoMelhorias from "./pages/gestao/GestaoMelhorias";
import GestaoRH from "./pages/gestao/GestaoRH";
import GestaoOperacoes from "./pages/gestao/GestaoOperacoes";
import GestaoFinanceiro from "./pages/gestao/GestaoFinanceiro";
import GestaoTecnologia from "./pages/gestao/GestaoTecnologia";
import GestaoComercial from "./pages/gestao/GestaoComercial";
import GestaoUsuarios from "./pages/gestao/GestaoUsuarios";
import Install from "./pages/Install";
const queryClient = new QueryClient();

// Protected Route component - saves intended destination before redirecting to login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/biometric-setup" element={<BiometricSetup />} />
      <Route path="/install" element={<Install />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agenda" 
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/avisos" 
        element={
          <ProtectedRoute>
            <Avisos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/performance" 
        element={
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/blog" 
        element={
          <ProtectedRoute>
            <Blog />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/novo-agendamento" 
        element={
          <ProtectedRoute>
            <NovoAgendamento />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/historico" 
        element={
          <ProtectedRoute>
            <Historico />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agendamento-sucesso" 
        element={
          <ProtectedRoute>
            <AgendamentoSucesso />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reagendamento" 
        element={
          <ProtectedRoute>
            <Reagendamento />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/veiculo/:vehicleId" 
        element={
          <ProtectedRoute>
            <VehicleDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/servico/:vehicleId" 
        element={
          <ProtectedRoute>
            <ServicoDetalhes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orcamento/:osId" 
        element={<OrcamentoCliente />} 
      />
      {/* Admin Routes - Protected by role */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/agendamentos" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminAgendamentos />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboardOverview />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/nova-os" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminNovaOS />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/ordens-servico" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminOrdensServico />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/ordens-servico/:osId" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminOSDetalhes />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/patio"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminPatio />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/patio/:patioId" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminPatioDetalhes />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/feedback-mecanicos" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminMechanicFeedback />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics-mecanicos" 
        element={
          <ProtectedRoute>
            <AdminOnlyRoute>
              <AdminMechanicAnalytics />
            </AdminOnlyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/financeiro" 
        element={
          <ProtectedRoute>
            <AdminOnlyRoute>
              <AdminFinanceiro />
            </AdminOnlyRoute>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/admin/clientes" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminClientes />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/servicos" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminServicos />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/configuracoes" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminConfiguracoes />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/documentacao" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDocumentacao />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      {/* Gestão Routes */}
      <Route 
        path="/gestao" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoDashboards />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/dashboard/:dashboardId" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoDashboardView />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/melhorias" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoMelhorias />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/rh" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoRH />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/operacoes" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoOperacoes />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/financeiro" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoFinanceiro />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/tecnologia" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GestaoTecnologia />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
        <Route 
          path="/gestao/comercial" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <GestaoComercial />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gestao/usuarios" 
          element={
            <ProtectedRoute>
              <AdminOnlyRoute>
                <GestaoUsuarios />
              </AdminOnlyRoute>
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
