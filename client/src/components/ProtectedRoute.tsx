import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireCompanyAdmin?: boolean;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireSuperAdmin, 
  requireCompanyAdmin,
  requireAuth 
}: ProtectedRouteProps) {
  const { user, isSuperAdmin, isCompanyAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (requireAuth && !user) {
      setLocation("/");
      return;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
      setLocation("/");
      return;
    }

    if (requireCompanyAdmin && !isCompanyAdmin) {
      setLocation("/");
      return;
    }
  }, [user, isSuperAdmin, isCompanyAdmin, requireAuth, requireSuperAdmin, requireCompanyAdmin, setLocation]);

  if (requireAuth && !user) {
    return null;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return null;
  }

  if (requireCompanyAdmin && !isCompanyAdmin) {
    return null;
  }

  return <>{children}</>;
}
