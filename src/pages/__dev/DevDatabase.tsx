import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Play, 
  Copy, 
  Download,
  RefreshCw,
  Table as TableIcon,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const TABLES = [
  "companies", "roles", "profiles", "user_roles", "user_companies", 
  "user_company_access", "invite_codes", "services", "vehicles", 
  "vehicle_history", "appointments", "appointment_services", 
  "appointment_funnel", "ordens_servico", "ordem_servico_items", 
  "ordem_servico_history", "payments", "payment_methods", "invoices", 
  "parts", "parts_categories", "stock_movements", "patio_stages", 
  "patio_movements", "promotions", "events", "event_participants"
];

export default function DevDatabase() {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickQuery = (table: string) => {
    setSelectedTable(table);
    setQuery(`SELECT * FROM ${table} LIMIT 10;`);
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error("Digite uma query SQL");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('execute_sql', { 
        query_text: query 
      });

      if (error) {
        // Fallback: tentar query direta (apenas SELECT)
        if (query.trim().toUpperCase().startsWith('SELECT')) {
          const tableName = query.match(/FROM\s+(\w+)/i)?.[1];
          if (tableName) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from(tableName)
              .select('*')
              .limit(10);
            
            if (fallbackError) throw fallbackError;
            setResult({ data: fallbackData, count: fallbackData?.length || 0 });
            toast.success(`Query executada! ${fallbackData?.length || 0} resultados`);
            return;
          }
        }
        throw error;
      }

      setResult(data);
      toast.success("Query executada com sucesso!");
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
      console.error("Query error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para área de transferência");
  };

  const exportJSON = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-result-${Date.now()}.json`;
    a.click();
    toast.success("Exportado como JSON");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/__dev">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Database className="w-8 h-8" />
                Database Explorer
              </h1>
              <p className="text-muted-foreground mt-1">
                Explore e manipule o banco de dados
              </p>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5" />
              Tabelas Disponíveis ({TABLES.length})
            </CardTitle>
            <CardDescription>
              Clique em uma tabela para gerar query SELECT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TABLES.map((table) => (
                <Badge
                  key={table}
                  variant={selectedTable === table ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
                  onClick={() => handleQuickQuery(table)}
                >
                  {table}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Query Editor */}
        <Card>
          <CardHeader>
            <CardTitle>SQL Query Editor</CardTitle>
            <CardDescription>
              Execute queries SELECT, INSERT, UPDATE, DELETE (com cuidado!)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite sua query SQL aqui...&#10;&#10;Exemplo:&#10;SELECT * FROM companies WHERE is_active = true;"
              className="font-mono min-h-[150px]"
            />
            <div className="flex gap-2">
              <Button onClick={executeQuery} disabled={loading} className="gap-2">
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Executar Query
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(query)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setQuery("");
                  setResult(null);
                  setSelectedTable("");
                }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultados</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportJSON}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Quick Queries */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setQuery("SELECT * FROM companies;")}
              >
                Listar todas empresas
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setQuery("SELECT * FROM roles WHERE is_active = true;")}
              >
                Listar roles ativos
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setQuery("SELECT COUNT(*) FROM profiles;")}
              >
                Contar perfis
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setQuery("SELECT * FROM ordens_servico ORDER BY created_at DESC LIMIT 10;")}
              >
                Últimas 10 OS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
