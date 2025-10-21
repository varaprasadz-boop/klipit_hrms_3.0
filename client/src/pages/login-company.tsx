import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import klipitLogo from "@assets/Klipit By Bova_1761061110237.png";

export default function CompanyLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();

      if (data.user.role !== "COMPANY_ADMIN") {
        toast({
          title: "Access denied",
          description: "Please use the correct login portal",
          variant: "destructive",
        });
        return;
      }

      login(data.user, data.token);
      toast({ title: "Login successful" });
      
      // Small delay to ensure state updates before redirect
      setTimeout(() => {
        setLocation("/dashboard/admin");
      }, 100);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src={klipitLogo} alt="Klipit by Bova" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl text-center">Company Login</CardTitle>
          <CardDescription className="text-center">
            Access your company admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Company Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <div>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="pt-2 border-t">
                <span>Don't have an account? </span>
                <a href="/register/company" className="text-primary hover:underline font-medium" data-testid="link-register">
                  Register here
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
