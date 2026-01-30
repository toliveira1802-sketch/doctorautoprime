import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { Header } from '@/components/layout/Header'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Loader2 } from 'lucide-react'

// Client Pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Index from '@/pages/Index'
import Agenda from '@/pages/Agenda'
import Profile from '@/pages/Profile'
import NovoAgendamento from '@/pages/NovoAgendamento'
import AgendamentoSucesso from '@/pages/AgendamentoSucesso'
import Avisos from '@/pages/Avisos'
import TesteExpandido from '@/pages/TesteExpandido'
import Historico from '@/pages/Historico'
import Configuracoes from '@/pages/Configuracoes'
import Performance from '@/pages/Performance'
import VehicleDetails from '@/pages/VehicleDetails'
import ServicoDetalhes from '@/pages/ServicoDetalhes'
import OrcamentoCliente from '@/pages/OrcamentoCliente'
import Reagendamento from '@/pages/Reagendamento'
import Blog from '@/pages/Blog'
import Promocoes from '@/pages/Promocoes'
import OSUltimate from '@/pages/OSUltimate'
import Install from '@/pages/Install'
import BiometricSetup from '@/pages/BiometricSetup'
import VerifyOTP from '@/pages/VerifyOTP'
import NotFound from '@/pages/NotFound'
import PaginaTeste from '@/pages/PaginaTeste'
import TesteSimples from '@/pages/TesteSimples'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminPatio from '@/pages/admin/AdminPatio'
import AdminClientes from '@/pages/admin/AdminClientes'
import AdminOrdensServico from '@/pages/admin/AdminOrdensServico'
import AdminNovaOS from '@/pages/admin/AdminNovaOS'
import AdminServicos from '@/pages/admin/AdminServicos'
import AdminOSDetalhes from '@/pages/admin/AdminOSDetalhes'
import AdminAgendaMecanicos from '@/pages/admin/AdminAgendaMecanicos'
import AdminAgendamentos from '@/pages/admin/AdminAgendamentos'
import AdminConfiguracoes from '@/pages/admin/AdminConfiguracoes'
import AdminDocumentacao from '@/pages/admin/AdminDocumentacao'
import AdminFinanceiro from '@/pages/admin/AdminFinanceiro'
import AdminMechanicAnalytics from '@/pages/admin/AdminMechanicAnalytics'
import AdminMechanicFeedback from '@/pages/admin/AdminMechanicFeedback'
import AdminOperacional from '@/pages/admin/AdminOperacional'
import AdminPainelTV from '@/pages/admin/AdminPainelTV'
import AdminPatioDetalhes from '@/pages/admin/AdminPatioDetalhes'
import AdminProdutividade from '@/pages/admin/AdminProdutividade'

// Gestão Pages
import GestaoComercial from '@/pages/gestao/GestaoComercial'
import GestaoDashboards from '@/pages/gestao/GestaoDashboards'
import GestaoFinanceiro from '@/pages/gestao/GestaoFinanceiro'
import GestaoMelhorias from '@/pages/gestao/GestaoMelhorias'
import GestaoOperacoes from '@/pages/gestao/GestaoOperacoes'
import GestaoRH from '@/pages/gestao/GestaoRH'
import GestaoTecnologia from '@/pages/gestao/GestaoTecnologia'
import GestaoUsuarios from '@/pages/gestao/GestaoUsuarios'
import IAConfiguracoes from '@/pages/gestao/ia/IAConfiguracoes'
import MigracaoTrello from '@/pages/gestao/MigracaoTrello'

// Cliente Pages
import ClienteDashboard from '@/pages/cliente/ClienteDashboard'

// Protected Route wrapper
function ProtectedRoute({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) {
    const { isAuthenticated, isLoading, role } = useAuth()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRoles && role && !requiredRoles.includes(role)) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

// Client Layout
function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Header showMenu={false} />
            <main className="container max-w-2xl mx-auto p-4">
                {children}
            </main>
            <BottomNavigation />
        </div>
    )
}

// Admin Layout (local version)
function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex">
                <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    )
}

// Root redirect component - redirects based on user role
function RootRedirect() {
    const { role } = useUserRole()
    
    // Redirect based on role
    if (role === 'gestao' || role === 'dev') {
        return <Navigate to="/gestao" replace />
    } else if (role === 'admin') {
        return <Navigate to="/admin" replace />
    }
    
    // Default to client view
    return <ClientLayout><Index /></ClientLayout>
}

export default function App() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

            {/* Root - Home do Cliente (pública) */}
            <Route path="/" element={<Index />} />

            {/* Client Routes */}
            <Route path="/agenda" element={
                <ProtectedRoute>
                    <ClientLayout><Agenda /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <ClientLayout><Profile /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/avisos" element={
                <ProtectedRoute>
                    <ClientLayout><Avisos /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/novo-agendamento" element={
                <ProtectedRoute>
                    <ClientLayout><NovoAgendamento /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/agendamento-sucesso" element={
                <ProtectedRoute>
                    <ClientLayout><AgendamentoSucesso /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/historico" element={
                <ProtectedRoute>
                    <ClientLayout><Historico /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
                <ProtectedRoute>
                    <ClientLayout><Configuracoes /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/performance" element={
                <ProtectedRoute>
                    <ClientLayout><Performance /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/veiculo/:id" element={
                <ProtectedRoute>
                    <ClientLayout><VehicleDetails /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/servico/:id" element={
                <ProtectedRoute>
                    <ClientLayout><ServicoDetalhes /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/orcamento/:id" element={
                <ProtectedRoute>
                    <ClientLayout><OrcamentoCliente /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/reagendamento" element={
                <ProtectedRoute>
                    <ClientLayout><Reagendamento /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/blog" element={
                <ClientLayout><Blog /></ClientLayout>
            } />
            <Route path="/promocoes" element={
                <ClientLayout><Promocoes /></ClientLayout>
            } />
            <Route path="/os-ultimate" element={<OSUltimate />} />
            <Route path="/pagina-teste" element={<PaginaTeste />} />
            <Route path="/teste-simples" element={<TesteSimples />} />
            <Route path="/install" element={<Install />} />
            <Route path="/biometric-setup" element={
                <ProtectedRoute>
                    <BiometricSetup />
                </ProtectedRoute>
            } />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/teste-expandido" element={
                <ProtectedRoute>
                    <AdminLayoutWrapper><TesteExpandido /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminDashboard /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/agendamentos" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><Agenda /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/patio" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminPatio /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/clientes" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminClientes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/ordens-servico" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminOrdensServico /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/nova-os" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminNovaOS /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/os/:osId" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminOSDetalhes />
                </ProtectedRoute>
            } />
            <Route path="/admin/servicos" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminServicos /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/financeiro" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminFinanceiro /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminConfiguracoes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/agenda-mecanicos" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminAgendaMecanicos /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/agendamentos-admin" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminAgendamentos /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/documentacao" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminDocumentacao /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/mechanic-analytics" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminMechanicAnalytics /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/mechanic-feedback" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminMechanicFeedback /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/operacional" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminOperacional /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/painel-tv" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminPainelTV />
                </ProtectedRoute>
            } />
            <Route path="/admin/patio/:patioId" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminPatioDetalhes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/produtividade" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper><AdminProdutividade /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />

            {/* Gestão Routes */}
            <Route path="/gestao" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoDashboards /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/agendamentos" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><Agenda /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/patio" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminPatio /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/clientes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminClientes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/ordens-servico" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminOrdensServico /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/nova-os" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminNovaOS /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/os/:osId" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminOSDetalhes />
                </ProtectedRoute>
            } />
            <Route path="/gestao/servicos" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminServicos /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/financeiro" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoFinanceiro /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/configuracoes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminConfiguracoes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/comercial" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoComercial /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/melhorias" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoMelhorias /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/operacoes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoOperacoes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/rh" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoRH /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/tecnologia" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoTecnologia /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/usuarios" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><GestaoUsuarios /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/ia-configuracoes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><IAConfiguracoes /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/migracao-trello" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><MigracaoTrello /></AdminLayoutWrapper>
                </ProtectedRoute>
            } />

            {/* Cliente Dashboard (alternativo) */}
            <Route path="/cliente/dashboard" element={
                <ProtectedRoute>
                    <ClientLayout><ClienteDashboard /></ClientLayout>
                </ProtectedRoute>
            } />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
