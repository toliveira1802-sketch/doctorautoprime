import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "gestao" | "user";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user"); // Default to user if error
        } else {
          setRole(data?.role as UserRole || "user");
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
    isAdmin: role === "admin",
    isGestao: role === "gestao",
    hasAdminAccess: role === "admin" || role === "gestao",
    isUser: role === "user",
    isLoading,
  };
}
