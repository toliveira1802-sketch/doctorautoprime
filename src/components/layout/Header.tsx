import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UnifiedViewSwitcher } from './UnifiedViewSwitcher'
import { getInitials } from '@/lib/utils'
import { Bell, Menu, LogOut, Settings, User } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
    onMenuClick?: () => void
    showMenu?: boolean
}

export function Header({ onMenuClick, showMenu = true }: HeaderProps) {
    const { profile, signOut, isAuthenticated, role, user } = useAuth()
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário'
    const displayEmail = user?.email || ''

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
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">DA</span>
                        </div>
                        <span className="font-semibold hidden sm:inline-block">Doctor Auto Prime</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Switcher Unificado */}
                    {isAuthenticated && (
                        <div className="hidden md:flex mr-2">
                            <UnifiedViewSwitcher variant="buttons" />
                        </div>
                    )}

                    {isAuthenticated ? (
                        <>
                            <Button variant="ghost" size="icon" asChild>
                                <Link to="/avisos">
                                    <Bell className="h-5 w-5" />
                                </Link>
                            </Button>

                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile?.avatar_url || undefined} />
                                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                    </Avatar>
                                </Button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg animate-fade-in">
                                        <div className="px-2 py-1.5 text-sm font-medium">
                                            {displayName}
                                        </div>
                                        <div className="px-2 py-1 text-xs text-muted-foreground">
                                            {displayEmail}
                                        </div>
                                        <div className="px-2 py-1 text-xs text-muted-foreground capitalize">
                                            Perfil: {role || 'user'}
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
                                            to="/admin/configuracoes"
                                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            Configurações
                                        </Link>
                                        <div className="my-1 h-px bg-border" />
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false)
                                                signOut()
                                            }}
                                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Button asChild size="sm">
                            <Link to="/login">Entrar</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
