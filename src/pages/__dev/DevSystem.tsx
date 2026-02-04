import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cpu, HardDrive, Wifi, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DevSystem() {
  const [info, setInfo] = useState({
    userAgent: "",
    platform: "",
    language: "",
    online: true,
    memory: 0,
    cores: 0
  });

  useEffect(() => {
    setInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      // @ts-ignore
      memory: navigator.deviceMemory || 0,
      cores: navigator.hardwareConcurrency || 0
    });
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/__dev">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Cpu className="w-8 h-8" />
              System Info
            </h1>
            <p className="text-muted-foreground mt-1">
              Informações do sistema e ambiente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Plataforma:</strong> {info.platform}</div>
              <div><strong>Linguagem:</strong> {info.language}</div>
              <div><strong>Cores CPU:</strong> {info.cores}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Status:</strong> {info.online ? "Online" : "Offline"}</div>
              <div><strong>User Agent:</strong> {info.userAgent.substring(0, 50)}...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Node Env:</strong> {import.meta.env.MODE}</div>
              <div><strong>Base URL:</strong> {import.meta.env.BASE_URL}</div>
              <div><strong>DEV:</strong> {import.meta.env.DEV ? "Sim" : "Não"}</div>
              <div><strong>PROD:</strong> {import.meta.env.PROD ? "Sim" : "Não"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>LocalStorage:</strong> {Object.keys(localStorage).length} itens</div>
              <div><strong>SessionStorage:</strong> {Object.keys(sessionStorage).length} itens</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
