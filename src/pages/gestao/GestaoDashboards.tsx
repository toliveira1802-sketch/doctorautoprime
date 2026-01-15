import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UserCog, 
  Cog, 
  DollarSign, 
  Laptop, 
  Megaphone, 
  Lightbulb,
  ArrowRight,
  FileText,
  Table,
  ListChecks,
  BarChart3,
  FileSpreadsheet,
  FolderPlus,
  Plus
} from "lucide-react";
import { AddDirectoryDialog } from "@/components/gestao/AddDirectoryDialog";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  FileText,
  Table,
  ListChecks,
  BarChart3,
  FileSpreadsheet,
  FolderPlus,
  UserCog,
  Cog,
  DollarSign,
  Laptop,
  Megaphone,
  Lightbulb,
};

const fixedModules = [
  { 
    title: "Recursos Humanos", 
    description: "Gerencie mecânicos, performance e feedbacks da equipe",
    url: "/gestao/rh", 
    icon: "UserCog", 
    color: "from-blue-500 to-blue-600" 
  },
  { 
    title: "Operações", 
    description: "Acompanhe agendamentos, status e fluxo operacional",
    url: "/gestao/operacoes", 
    icon: "Cog", 
    color: "from-emerald-500 to-emerald-600" 
  },
  { 
    title: "Financeiro", 
    description: "Monitore faturamento, metas e indicadores financeiros",
    url: "/gestao/financeiro", 
    icon: "DollarSign", 
    color: "from-amber-500 to-amber-600" 
  },
  { 
    title: "Tecnologia", 
    description: "Dados do sistema, usuários e métricas de uso",
    url: "/gestao/tecnologia", 
    icon: "Laptop", 
    color: "from-purple-500 to-purple-600" 
  },
  { 
    title: "Comercial e Marketing", 
    description: "Promoções, campanhas e aquisição de clientes",
    url: "/gestao/comercial", 
    icon: "Megaphone", 
    color: "from-rose-500 to-rose-600" 
  },
  { 
    title: "Melhorias", 
    description: "Sugestões e ideias para evolução do sistema",
    url: "/gestao/melhorias", 
    icon: "Lightbulb", 
    color: "from-cyan-500 to-cyan-600" 
  },
];

export default function GestaoDashboards() {
  const navigate = useNavigate();

  const { data: customDirectories = [], refetch } = useQuery({
    queryKey: ["gestao-directories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gestao_dashboards")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const allModules = [
    ...fixedModules,
    ...customDirectories.map((dir) => ({
      title: dir.nome,
      description: dir.descricao || "Diretório personalizado",
      url: `/gestao/custom/${dir.id}`,
      icon: dir.icone || "FileText",
      color: dir.cor || "from-gray-500 to-gray-600",
      isCustom: true,
    })),
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão</h1>
        <p className="text-muted-foreground">Dashboards e indicadores de desempenho</p>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {allModules.map((module, index) => {
          const IconComponent = iconMap[module.icon] || FileText;
          return (
            <Card
              key={module.url || index}
              className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col"
              onClick={() => navigate(module.url)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                <div>
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {module.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center gap-2 mt-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-2">
                  <span className="text-sm font-medium">Acessar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}

      </div>
    </div>
  );
}
