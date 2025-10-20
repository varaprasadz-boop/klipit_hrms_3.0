import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SuperAdminFooter from "@/components/SuperAdminFooter";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CompanyLogin from "@/pages/login-company";
import EmployeeLogin from "@/pages/login-employee";
import SuperAdminLogin from "@/pages/superadmin-login";
import RegisterCompany from "@/pages/register-company";
import WaitingApproval from "@/pages/waiting-approval";
import OfflineRequests from "@/pages/offline-requests";
import SuperAdminDashboardPage from "@/pages/superadmin/dashboard";
import CustomersPage from "@/pages/superadmin/customers";
import DomainRequestsPage from "@/pages/superadmin/domain-requests";
import OfflineRequestsPage from "@/pages/superadmin/offline-requests";
import OrdersPage from "@/pages/superadmin/orders";
import PlansPage from "@/pages/superadmin/plans";
import UsersPage from "@/pages/superadmin/users";
import AddonsPage from "@/pages/superadmin/addons";
import SupportPage from "@/pages/superadmin/support";
import SuperAdminSettingsPage from "@/pages/superadmin/settings";
import AuditLogsPage from "@/pages/superadmin/audit-logs";
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
      <Route path="/register/company" component={RegisterCompany} />
      <Route path="/waiting-approval" component={WaitingApproval} />
      <Route path="/offline-requests" component={OfflineRequests} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      
      <Route path="/superadmin">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <SuperAdminDashboardPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/customers">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <CustomersPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/domain-requests">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <DomainRequestsPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/offline-requests">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <OfflineRequestsPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/orders">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <OrdersPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/plans">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <PlansPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/users">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <UsersPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/addons">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <AddonsPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/support">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <SupportPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/settings">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <SuperAdminSettingsPage />
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/audit-logs">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <AuditLogsPage />
          </SuperAdminLayout>
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
      <Route path="/dashboard/admin/settings" component={SettingsPage} />
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
