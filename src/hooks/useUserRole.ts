import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "dev" | "admin" | "gestao" | "user";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // DEVELOPMENT MODE: Default to admin when auth is disabled
          console.log("No user found - using development mode with admin role");
          setRole("admin");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user"); // Default to user if error
        } else if (data) {
          console.log("User role found:", data.role);
          setRole(data.role as UserRole);
        } else {
          console.log("No role found for user, defaulting to user");
          setRole("user");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRole("user");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    isDev: role === "dev",
    isAdmin: role === "admin",
    isGestao: role === "gestao",
    // Dev, gestao, and admin all have access to Gestão module
    hasGestaoAccess: role === "dev" || role === "gestao" || role === "admin",
    // Admin access includes dev, gestao, and admin
    hasAdminAccess: role === "dev" || role === "admin" || role === "gestao",
    // Can manage roles: only dev and gestao
    canManageRoles: role === "dev" || role === "gestao",
    isUser: role === "user",
    isLoading,
  };
}
