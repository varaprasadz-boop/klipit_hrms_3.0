import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, User, Lock } from "lucide-react";

interface LoginFormProps {
  type: "company" | "employee";
  onLogin?: (username: string, password: string) => void;
}

export default function LoginForm({ type, onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${type} login:`, { username, password });
    onLogin?.(username, password);
  };

  const isCompany = type === "company";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            {isCompany ? (
              <Building2 className="h-12 w-12 text-primary" />
            ) : (
              <User className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {isCompany ? "Company Login" : "Employee Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {isCompany 
              ? "Access your company admin dashboard" 
              : "Access your employee portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {isCompany ? "Company ID / Email" : "Employee ID / Email"}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={isCompany ? "company@example.com" : "employee@example.com"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
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
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" data-testid="button-login">
              Sign In
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
