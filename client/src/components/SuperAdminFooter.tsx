import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

export default function SuperAdminFooter() {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/superadmin">
        <Button
          size="lg"
          className="shadow-lg"
          data-testid="button-superadmin-shortcut"
        >
          <Shield className="h-5 w-5 mr-2" />
          Super Admin
        </Button>
      </Link>
    </div>
  );
}
