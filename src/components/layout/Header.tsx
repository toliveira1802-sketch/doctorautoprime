import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { Bell, Menu, LogOut, Settings, User, LayoutDashboard, Users, Briefcase } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
    onMenuClick?: () => void
    showMenu?: boolean
}

export function Header({ onMenuClick, showMenu = true }: HeaderProps) {
    const { profile, signOut, isAuthenticated, role } = useAuth()
    const [showDropdown, setShowDropdown] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const isAdmin = location.pathname.startsWith('/admin')
    const isGestao = location.pathname.startsWith('/gestao')
    const isCliente = !isAdmin && !isGestao

    // Determine which views the user can access based on their role
    const canAccessCliente = role === 'user' || role === 'admin' || role === 'gestao' || role === 'dev'
    const canAccessAdmin = role === 'admin' || role === 'dev'
    const canAccessGestao = role === 'gestao' || role === 'dev'

    const handleViewSwitch = (view: 'cliente' | 'admin' | 'gestao') => {
        switch (view) {
            case 'cliente':
                navigate('/')
                break
            case 'admin':
                navigate('/admin')
                break
            case 'gestao':
                navigate('/gestao')
                break
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    {showMenu && (
                        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-doctor-primary text-white font-bold">
                            D
                        </div>
                        <span className="font-semibold text-lg hidden sm:inline-block">
                            Doctor Auto Prime
                        </span>
                    </Link>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center gap-2">
                        {/* Profile Switcher Icons */}
                        <div className="flex items-center gap-1 mr-2 border-r pr-2">
                            {canAccessCliente && (
                                <Button
                                    variant={isCliente ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => handleViewSwitch('cliente')}
                                    title="Visão Cliente"
                                    className="h-9 w-9"
                                >
                                    <User className="h-4 w-4" />
                                </Button>
                            )}
                            {canAccessAdmin && (
                                <Button
                                    variant={isAdmin ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => handleViewSwitch('admin')}
                                    title="Visão Admin"
                                    className="h-9 w-9"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                </Button>
                            )}
                            {canAccessGestao && (
                                <Button
                                    variant={isGestao ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => handleViewSwitch('gestao')}
                                    title="Visão Gestão"
                                    className="h-9 w-9"
                                >
                                    <Briefcase className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/avisos">
                                <Bell className="h-5 w-5" />
                            </Link>
                        </Button>

                        <div className="relative">
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                    <AvatarFallback>
                                        {getInitials(profile?.full_name || 'U')}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg animate-fade-in">
                                    <div className="px-2 py-1.5 text-sm font-medium">
                                        {profile?.full_name || 'Usuário'}
                                    </div>
                                    <div className="px-2 py-1 text-xs text-muted-foreground">
                                        {profile?.email}
                                    </div>
                                    <div className="px-2 py-1 text-xs text-muted-foreground capitalize">
                                        Perfil: {profile?.role || 'user'}
                                    </div>
                                    <div className="my-1 h-px bg-border" />
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Perfil
                                    </Link>
                                    <Link
                                        to={isAdmin ? '/admin/configuracoes' : isGestao ? '/gestao/configuracoes' : '/configuracoes'}
                                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        Configurações
                                    </Link>
                                    <div className="my-1 h-px bg-border" />
                                    <button
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                                        onClick={() => {
                                            setShowDropdown(false)
                                            signOut()
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
