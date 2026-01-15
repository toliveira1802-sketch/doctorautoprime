import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, Search, RefreshCw, Crown, UserCog, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type UserRole = "dev" | "gestao" | "admin" | "user";

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: UserRole | null;
}

const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  dev: { label: "Desenvolvedor", color: "bg-purple-500", icon: <Crown className="h-3 w-3" /> },
  gestao: { label: "Gestão", color: "bg-blue-500", icon: <UserCog className="h-3 w-3" /> },
  admin: { label: "Admin", color: "bg-orange-500", icon: <Shield className="h-3 w-3" /> },
  user: { label: "Cliente", color: "bg-gray-500", icon: <User className="h-3 w-3" /> },
};

export default function GestaoUsuarios() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  const { isDev, canManageRoles } = useUserRole();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role as UserRole]) || []);
      
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        user_id: profile.user_id,
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        role: rolesMap.get(profile.user_id) || "user",
      }));

      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canManageRoles) {
      fetchUsers();
    }
  }, [canManageRoles]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.full_name?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Prevent changing own role
    if (userId === currentUser?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode alterar seu próprio role.",
        variant: "destructive",
      });
      return;
    }

    // Prevent gestão from assigning dev role
    if (!isDev && newRole === "dev") {
      toast({
        title: "Ação não permitida",
        description: "Apenas desenvolvedores podem atribuir o role de desenvolvedor.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingUserId(userId);
    try {
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.user_id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "Role atualizado",
        description: `O role foi alterado para ${roleConfig[newRole].label}.`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getAvailableRoles = (): UserRole[] => {
    if (isDev) {
      return ["dev", "gestao", "admin", "user"];
    }
    // Gestão can assign all except dev
    return ["gestao", "admin", "user"];
  };

  const stats = {
    total: users.length,
    dev: users.filter(u => u.role === "dev").length,
    gestao: users.filter(u => u.role === "gestao").length,
    admin: users.filter(u => u.role === "admin").length,
    user: users.filter(u => u.role === "user").length,
  };

  if (!canManageRoles) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-muted-foreground">
              Gerencie os roles e permissões dos usuários do sistema
            </p>
          </div>
          <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Devs</p>
                  <p className="text-2xl font-bold">{stats.dev}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gestão</p>
                  <p className="text-2xl font-bold">{stats.gestao}</p>
                </div>
                <UserCog className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admin</p>
                  <p className="text-2xl font-bold">{stats.admin}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold">{stats.user}</p>
                </div>
                <User className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os roles</SelectItem>
                  <SelectItem value="dev">Desenvolvedor</SelectItem>
                  <SelectItem value="gestao">Gestão</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Role Atual</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.full_name || "Sem nome"}
                                {user.user_id === currentUser?.id && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Você
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {user.role && (
                            <Badge className={`${roleConfig[user.role].color} text-white flex items-center gap-1 w-fit`}>
                              {roleConfig[user.role].icon}
                              {roleConfig[user.role].label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.user_id === currentUser?.id ? (
                            <span className="text-sm text-muted-foreground">-</span>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={updatingUserId === user.user_id}
                                >
                                  {updatingUserId === user.user_id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Alterar Role"
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Alterar Role do Usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Selecione o novo role para <strong>{user.full_name || "este usuário"}</strong>.
                                    Esta ação afetará imediatamente as permissões do usuário.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="grid grid-cols-2 gap-2 py-4">
                                  {getAvailableRoles().map((role) => (
                                    <Button
                                      key={role}
                                      variant={user.role === role ? "default" : "outline"}
                                      className="justify-start"
                                      onClick={() => handleRoleChange(user.user_id, role)}
                                      disabled={user.role === role}
                                    >
                                      <span className={`h-2 w-2 rounded-full ${roleConfig[role].color} mr-2`} />
                                      {roleConfig[role].label}
                                    </Button>
                                  ))}
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hierarquia de Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10">
                <Crown className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-500">Desenvolvedor</p>
                  <p className="text-xs text-muted-foreground">
                    Acesso total ao sistema. Pode atribuir qualquer role.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
                <UserCog className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-500">Gestão</p>
                  <p className="text-xs text-muted-foreground">
                    Acesso à gestão. Pode atribuir roles exceto dev.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-500">Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Acesso administrativo. Não pode gerenciar roles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-500/10">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-500">Cliente</p>
                  <p className="text-xs text-muted-foreground">
                    Acesso básico à área do cliente.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}