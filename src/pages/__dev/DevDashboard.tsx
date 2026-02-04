import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  FileCode, 
  Terminal, 
  Bug, 
  Cpu, 
  GitBranch,
  Activity,
  Zap,
  Package,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DevDashboard() {
  const devTools = [
    {
      title: "Database Explorer",
      description: "Visualizar e manipular tabelas do Supabase",
      icon: Database,
      path: "/__dev/database",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "API Tester",
      description: "Testar endpoints e queries do Supabase",
      icon: Terminal,
      path: "/__dev/api-tester",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Component Library",
      description: "Biblioteca de componentes e storybook",
      icon: Package,
      path: "/__dev/components",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Debug Console",
      description: "Console de debug em tempo real",
      icon: Bug,
      path: "/__dev/debug",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Performance Monitor",
      description: "Monitorar performance e métricas",
      icon: Activity,
      path: "/__dev/performance",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "System Info",
      description: "Informações do sistema e ambiente",
      icon: Cpu,
      path: "/__dev/system",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Git Status",
      description: "Status do repositório e branches",
      icon: GitBranch,
      path: "/__dev/git",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10"
    },
    {
      title: "Code Generator",
      description: "Gerar código boilerplate",
      icon: FileCode,
      path: "/__dev/generator",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Schema Visualizer",
      description: "Visualizar schema do banco de dados",
      icon: Eye,
      path: "/__dev/schema",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      title: "Quick Actions",
      description: "Ações rápidas e utilitários",
      icon: Zap,
      path: "/__dev/actions",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🛠️ Developer Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Ferramentas e utilitários para desenvolvimento
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
              DEV MODE
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">27</div>
              <p className="text-xs text-muted-foreground">Tabelas no DB</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">171</div>
              <p className="text-xs text-muted-foreground">Arquivos TS/TSX</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">44</div>
              <p className="text-xs text-muted-foreground">Migrações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">v1.1</div>
              <p className="text-xs text-muted-foreground">Versão Atual</p>
            </CardContent>
          </Card>
        </div>

        {/* Dev Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.path} to={tool.path}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                        <Icon className={`w-6 h-6 ${tool.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" asChild className="justify-start">
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Supabase Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Vercel Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <a href="https://github.com/toliveira1802-sketch/doctorautoprime" target="_blank" rel="noopener noreferrer">
                  GitHub Repo
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link to="/admin">
                  Admin View
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
