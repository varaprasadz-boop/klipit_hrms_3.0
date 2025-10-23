import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
  planId: string;
  maxEmployees: number;
}

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  duration: number;
  maxEmployees: number;
  features: string[];
}

export default function WaitingApproval() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<Company>({
    queryKey: ["/api/companies", user?.companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${user?.companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch company');
      return response.json();
    },
    enabled: !!user?.companyId,
  });

  const { data: plan, isLoading: planLoading } = useQuery<Plan>({
    queryKey: ["/api/plans", company?.planId],
    queryFn: async () => {
      const response = await fetch(`/api/plans/${company?.planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch plan');
      return response.json();
    },
    enabled: !!company?.planId,
  });

  // Redirect active companies to dashboard (in useEffect to avoid render loop)
  useEffect(() => {
    if (!companyLoading && company?.status === "active") {
      setLocation("/dashboard/admin");
    }
  }, [company?.status, companyLoading, setLocation]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/login/company");
  };

  const getStatusBadge = () => {
    if (!company) return null;

    switch (company.status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1" data-testid="badge-status-pending">
            <Clock className="h-3 w-3" />
            Pending Approval
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="gap-1" data-testid="badge-status-active">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1" data-testid="badge-status-rejected">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="outline" className="gap-1" data-testid="badge-status-suspended">
            <Clock className="h-3 w-3" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading your company information...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state
  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Company Data</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an error loading your company information.
          </p>
          <Button onClick={handleLogout} data-testid="button-logout">
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex gap-4 mb-6 text-sm border-b items-center">
            <a href="/waiting-approval" className="text-primary font-medium border-b-2 border-primary pb-2" data-testid="link-dashboard">
              Dashboard
            </a>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="ml-auto gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Welcome to Klipit HRMS</h1>
            {getStatusBadge()}
          </div>
        </div>

        {/* Status Card */}
        <Card className={`mb-6 ${company?.status === "pending" ? "bg-yellow-50 border-yellow-200" : ""}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Clock className="h-12 w-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold">
                {company?.status === "pending" && "Registration Complete - Awaiting Approval"}
                {company?.status === "rejected" && "Application Not Approved"}
                {company?.status === "suspended" && "Account Suspended"}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {company?.status === "pending" && "Thank you for registering! Our team is reviewing your application and payment. You will receive an email notification once your account is activated."}
                {company?.status === "rejected" && "Unfortunately, your application was not approved. Please contact our support team for more information."}
                {company?.status === "suspended" && "Your account has been temporarily suspended. Please contact support for assistance."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        {company && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Company Name:</span>
                  <p className="font-medium text-lg">{company.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{company.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Employees:</span>
                  <p className="font-medium">{company.maxEmployees}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{company.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Plan */}
        {plan && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{plan.displayName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Up to {plan.maxEmployees} employees
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about your registration or need assistance, please contact our support team.
              </p>
              <Button variant="outline" className="mt-2" data-testid="button-contact-support">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
