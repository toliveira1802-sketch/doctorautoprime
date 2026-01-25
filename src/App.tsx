import GestaoIAs from '@/pages/gestao/ia/GestaoIAs'
import IAIndividual from '@/pages/gestao/ia/IAIndividual'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import Teste from '@/pages/Teste'
import TesteExpandido from '@/pages/TesteExpandido'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import Patio from '@/pages/admin/Patio'
import Clientes from '@/pages/admin/Clientes'
import OrdensServico from '@/pages/admin/OrdensServico'
import NovaOS from '@/pages/admin/NovaOS'
import Servicos from '@/pages/admin/Servicos'
import AdminOSDetalhes from '@/pages/admin/AdminOSDetalhes'

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

// Admin Layout
function AdminLayout({ children }: { children: React.ReactNode }) {
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

            {/* Root - redirects based on role */}
            <Route path="/" element={
                <ProtectedRoute>
                    <RootRedirect />
                </ProtectedRoute>
            } />

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
                    <ClientLayout>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Histórico - Em desenvolvimento</p>
                        </div>
                    </ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/veiculo/:id" element={
                <ProtectedRoute>
                    <ClientLayout>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Detalhes do Veículo - Em desenvolvimento</p>
                        </div>
                    </ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/teste" element={
                <ProtectedRoute>
                    <AdminLayout><Teste /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/teste-expandido" element={
                <ProtectedRoute>
                    <AdminLayout><TesteExpandido /></AdminLayout>
                </ProtectedRoute>
            } />
            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/agendamentos" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><Agenda isAdmin /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/patio" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><Patio /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/clientes" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><Clientes /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/ordens-servico" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><OrdensServico /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/nova-os" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><NovaOS /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/os/:osId" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><AdminOSDetalhes /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/servicos" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout><Servicos /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/financeiro" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Financeiro - Em desenvolvimento</p>
                        </div>
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayout>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Configurações - Em desenvolvimento</p>
                        </div>
                    </AdminLayout>
                </ProtectedRoute>
            } />

            {/* Gestão Routes */}
            <Route path="/gestao" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/agendamentos" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><Agenda isAdmin /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/patio" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><Patio /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/clientes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><Clientes /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/ordens-servico" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><OrdensServico /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/nova-os" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><NovaOS /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/os/:osId" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><AdminOSDetalhes /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/servicos" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout><Servicos /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/financeiro" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Financeiro - Em desenvolvimento</p>
                        </div>
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/gestao/configuracoes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayout>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Configurações - Em desenvolvimento</p>
                        </div>
                    </AdminLayout>
                </ProtectedRoute>
            } />

            {/* Catch all */}
          <Route path="/gestao/ia" element={
    <ProtectedRoute requiredRoles={['dev', 'gestao']}>
        <AdminLayout><GestaoIAs /></AdminLayout>
    </ProtectedRoute>
} />
<Route path="/gestao/ia/:id" element={
    <ProtectedRoute requiredRoles={['dev', 'gestao']}>
        <AdminLayout><IAIndividual /></AdminLayout>
    </ProtectedRoute>
} />       
          
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
