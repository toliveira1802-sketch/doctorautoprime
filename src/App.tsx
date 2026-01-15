import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";
import AdminNovaOS from "./pages/admin/AdminNovaOS";
import AdminPatioDetalhes from "./pages/admin/AdminPatioDetalhes";
import ServicoDetalhes from "./pages/ServicoDetalhes";
import VehicleDetails from "./pages/VehicleDetails";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

// Protected Route component - saves intended destination before redirecting to login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Save the intended destination
    localStorage.setItem('drprime_redirect', location.pathname);
    return <Navigate to="/login" replace />;
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
        path="/servico/:vehicleId" 
        element={
          <ProtectedRoute>
            <ServicoDetalhes />
          </ProtectedRoute>
        } 
      />
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/agendamentos" 
        element={
          <ProtectedRoute>
            <AdminAgendamentos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/nova-os" 
        element={
          <ProtectedRoute>
            <AdminNovaOS />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/patio/:patioId" 
        element={
          <ProtectedRoute>
            <AdminPatioDetalhes />
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
