import { AdminLayout } from "@/components/layout/AdminLayout";
import { Car } from "lucide-react";

export default function AdminPatio() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" />
          Pátio
        </h1>
        <p className="text-muted-foreground">Em desenvolvimento</p>
      </div>
    </AdminLayout>
  );
}
