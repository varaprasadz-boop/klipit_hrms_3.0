import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SuperAdminFooter from "@/components/SuperAdminFooter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CompanyLogin from "@/pages/login-company";
import EmployeeLogin from "@/pages/login-employee";
import SuperAdminLogin from "@/pages/superadmin-login";
import SuperAdminDashboard from "@/pages/superadmin-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import EmployeeDashboard from "@/pages/employee-dashboard";
import Attendance from "@/pages/attendance";
import Employees from "@/pages/employees";
import SettingsPage from "@/pages/settings";
import Lifecycle from "@/pages/lifecycle";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login/company" component={CompanyLogin} />
      <Route path="/login/employee" component={EmployeeLogin} />
      <Route path="/login/superadmin" component={SuperAdminLogin} />
      <Route path="/superadmin">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin">
        <ProtectedRoute requireCompanyAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/employee">
        <ProtectedRoute requireAuth>
          <EmployeeDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/attendance">
        <ProtectedRoute requireCompanyAdmin>
          <Attendance />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/employees">
        <ProtectedRoute requireCompanyAdmin>
          <Employees />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/settings">
        <ProtectedRoute requireCompanyAdmin>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/lifecycle">
        <ProtectedRoute requireCompanyAdmin>
          <Lifecycle />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <SuperAdminFooter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
