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
import EmployeesPage from "@/pages/organization/employees";
import SettingsPage from "@/pages/settings";
import CompanyInfoSettings from "@/pages/settings/company-info";
import EmailSMTPSettings from "@/pages/settings/email-smtp";
import ContactInfoSettings from "@/pages/settings/contact-info";
import PackageDetailsSettings from "@/pages/settings/package-details";
import LiveLocation from "@/pages/monitoring/live-location";
import Timeline from "@/pages/monitoring/timeline";
import CardView from "@/pages/monitoring/card-view";
import Lifecycle from "@/pages/lifecycle";
import DepartmentsPage from "@/pages/organization/departments";
import DesignationsPage from "@/pages/organization/designations";
import RolesLevelsPage from "@/pages/organization/roles-levels";
import CtcComponentsPage from "@/pages/organization/ctc-components";
import ShiftsPage from "@/pages/masters/shifts";
import HolidaysPage from "@/pages/masters/holidays";
import LeaveTypesPage from "@/pages/masters/leave-types";
import ExpenseTypesPage from "@/pages/masters/expense-types";
import PayrollPage from "@/pages/payroll";
import PayslipsPage from "@/pages/payslips";
import ReportsPage from "@/pages/reports";
import WorkflowsPage from "@/pages/admin/workflows";
import LeavePage from "@/pages/admin/leave";
import AdminNoticeboardPage from "@/pages/admin/noticeboard";
import EmployeeExpensesPage from "@/pages/employee/expenses";
import EmployeeAttendancePage from "@/pages/employee/attendance";
import EmployeeLeavePage from "@/pages/employee/leave";
import EmployeeNoticeboardPage from "@/pages/employee/noticeboard";
import EmployeePayslipsPage from "@/pages/employee/payslips";
import EmployeeProfilePage from "@/pages/employee/profile";
import TeamExpensesPage from "@/pages/manager/team-expenses";
import ExpenseDashboardPage from "@/pages/admin/expense-dashboard";

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
      <Route path="/dashboard/employee/expenses">
        <ProtectedRoute requireAuth>
          <EmployeeExpensesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/employee/attendance">
        <ProtectedRoute requireAuth>
          <EmployeeAttendancePage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/employee/leave">
        <ProtectedRoute requireAuth>
          <EmployeeLeavePage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/employee/noticeboard">
        <ProtectedRoute requireAuth>
          <EmployeeNoticeboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/employee/payslips">
        <ProtectedRoute requireAuth>
          <EmployeePayslipsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/employee/profile">
        <ProtectedRoute requireAuth>
          <EmployeeProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/manager/team-expenses">
        <ProtectedRoute requireAuth>
          <TeamExpensesPage />
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
      <Route path="/dashboard/admin/organization/employees">
        <ProtectedRoute requireCompanyAdmin>
          <EmployeesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/organization/departments">
        <ProtectedRoute requireCompanyAdmin>
          <DepartmentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/organization/designations">
        <ProtectedRoute requireCompanyAdmin>
          <DesignationsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/organization/roles-levels">
        <ProtectedRoute requireCompanyAdmin>
          <RolesLevelsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/roles">
        <ProtectedRoute requireCompanyAdmin>
          <RolesLevelsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/organization/ctc-components">
        <ProtectedRoute requireCompanyAdmin>
          <CtcComponentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/settings" component={SettingsPage} />
      <Route path="/dashboard/admin/settings/company-info" component={CompanyInfoSettings} />
      <Route path="/dashboard/admin/settings/email-smtp" component={EmailSMTPSettings} />
      <Route path="/dashboard/admin/settings/contact-info" component={ContactInfoSettings} />
      <Route path="/dashboard/admin/settings/package-details" component={PackageDetailsSettings} />
      <Route path="/dashboard/admin/monitoring/live-location" component={LiveLocation} />
      <Route path="/dashboard/admin/monitoring/timeline" component={Timeline} />
      <Route path="/dashboard/admin/monitoring/card-view" component={CardView} />
      <Route path="/dashboard/admin/lifecycle">
        <ProtectedRoute requireCompanyAdmin>
          <Lifecycle />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/masters/shifts">
        <ProtectedRoute requireCompanyAdmin>
          <ShiftsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/masters/holidays">
        <ProtectedRoute requireCompanyAdmin>
          <HolidaysPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/masters/leave-types">
        <ProtectedRoute requireCompanyAdmin>
          <LeaveTypesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/masters/expense-types">
        <ProtectedRoute requireCompanyAdmin>
          <ExpenseTypesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/payroll">
        <ProtectedRoute requireCompanyAdmin>
          <PayrollPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/payslips">
        <ProtectedRoute requireCompanyAdmin>
          <PayslipsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/expense-dashboard">
        <ProtectedRoute requireCompanyAdmin>
          <ExpenseDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/expenses">
        <ProtectedRoute requireCompanyAdmin>
          <ExpenseDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/reports">
        <ProtectedRoute requireCompanyAdmin>
          <ReportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/workflows">
        <ProtectedRoute requireCompanyAdmin>
          <WorkflowsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/leave">
        <ProtectedRoute requireCompanyAdmin>
          <LeavePage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admin/noticeboard">
        <ProtectedRoute requireCompanyAdmin>
          <AdminNoticeboardPage />
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
