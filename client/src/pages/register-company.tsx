import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";

export default function RegisterCompany() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    adminFirstName: "",
    adminLastName: "",
    phone: "",
    gender: "male",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the privacy policy & terms",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await apiRequest("POST", "/api/auth/register", registrationData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      login(data.user, data.token);
      
      toast({
        title: "Registration successful",
        description: "Your company has been registered. Awaiting approval from admin.",
      });
      
      setTimeout(() => {
        setLocation("/waiting-approval");
      }, 100);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Adventure starts here 🚀
          </h1>
          <p className="text-muted-foreground">
            AI-Driven HRMS for Modern Businesses.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              required
              data-testid="input-company-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">First Name</Label>
              <Input
                id="adminFirstName"
                placeholder="Enter your first name"
                value={formData.adminFirstName}
                onChange={(e) => handleChange("adminFirstName", e.target.value)}
                required
                data-testid="input-first-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminLastName">Last Name</Label>
              <Input
                id="adminLastName"
                placeholder="Enter your last name"
                value={formData.adminLastName}
                onChange={(e) => handleChange("adminLastName", e.target.value)}
                required
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              data-testid="input-phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
              <SelectTrigger id="gender" data-testid="select-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="··········"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                minLength={6}
                className="pr-10"
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="··········"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
                minLength={6}
                className="pr-10"
                data-testid="input-confirm-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-toggle-confirm-password"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              data-testid="checkbox-terms"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy policy & terms
              </a>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading} data-testid="button-register">
            {loading ? "Registering..." : "Register"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <span>Already have an account? </span>
            <a href="/login/company" className="text-primary hover:underline font-medium" data-testid="link-login">
              Log in instead
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
