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

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminPatio from '@/pages/admin/AdminPatio'
import AdminClientes from '@/pages/admin/AdminClientes'
import AdminOrdensServico from '@/pages/admin/AdminOrdensServico'
import AdminNovaOS from '@/pages/admin/AdminNovaOS'
import AdminServicos from '@/pages/admin/AdminServicos'
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
                    <AdminLayoutWrapper>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Financeiro - Em desenvolvimento</p>
                        </div>
                    </AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
                <ProtectedRoute requiredRoles={['admin', 'dev']}>
                    <AdminLayoutWrapper>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Configurações - Em desenvolvimento</p>
                        </div>
                    </AdminLayoutWrapper>
                </ProtectedRoute>
            } />

            {/* Gestão Routes */}
            <Route path="/gestao" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper><AdminDashboard /></AdminLayoutWrapper>
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
                    <AdminLayoutWrapper>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Financeiro - Em desenvolvimento</p>
                        </div>
                    </AdminLayoutWrapper>
                </ProtectedRoute>
            } />
            <Route path="/gestao/configuracoes" element={
                <ProtectedRoute requiredRoles={['gestao', 'dev']}>
                    <AdminLayoutWrapper>
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Configurações - Em desenvolvimento</p>
                        </div>
                    </AdminLayoutWrapper>
                </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
