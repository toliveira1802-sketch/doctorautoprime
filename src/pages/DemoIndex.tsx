import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  TestTube, 
  Sparkles, 
  Gift, 
  Home,
  ArrowRight 
} from "lucide-react";

export default function DemoIndex() {
  const navigate = useNavigate();

  const demos = [
    {
      id: 1,
      title: "OS Ultimate",
      description: "Interface moderna para visualização de Ordens de Serviço",
      path: "/os-ultimate",
      icon: Wrench,
      gradient: "from-red-600 to-red-800",
      available: true
    },
    {
      id: 2,
      title: "Página de Teste",
      description: "Componentes interativos do Shadcn/UI",
      path: "/pagina-teste",
      icon: TestTube,
      gradient: "from-purple-600 to-pink-600",
      available: true
    },
    {
      id: 3,
      title: "Teste Simples",
      description: "Página básica sem dependências",
      path: "/teste-simples",
      icon: Sparkles,
      gradient: "from-blue-600 to-cyan-600",
      available: true
    },
    {
      id: 4,
      title: "Promoções",
      description: "Ofertas e promoções especiais",
      path: "/promocoes",
      icon: Gift,
      gradient: "from-green-600 to-emerald-600",
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 mb-4">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white">
            Doctor Auto Prime
          </h1>
          <p className="text-xl text-slate-400">
            Páginas de Demonstração e Testes
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demos.map((demo) => {
            const Icon = demo.icon;
            
            return (
              <Card 
                key={demo.id}
                className="bg-slate-900/50 border-slate-800 backdrop-blur hover:border-slate-700 transition-all group cursor-pointer"
                onClick={() => navigate(demo.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${demo.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-red-400 transition-colors">
                    {demo.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {demo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full bg-gradient-to-r ${demo.gradient} hover:opacity-90`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(demo.path);
                    }}
                  >
                    Acessar Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Botão para Home Cliente */}
        <Card className="bg-slate-900/30 border-slate-800 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Ir para Home do Cliente
                </h3>
                <p className="text-sm text-slate-400">
                  Página principal do sistema
                </p>
              </div>
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm pt-8">
          <p>Doctor Auto Prime © 2026 - Todas as páginas são públicas</p>
        </div>

      </div>
    </div>
  );
}
