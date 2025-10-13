import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CompanyLogin from "@/pages/login-company";
import EmployeeLogin from "@/pages/login-employee";
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
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/employee" component={EmployeeDashboard} />
      <Route path="/dashboard/admin/attendance" component={Attendance} />
      <Route path="/dashboard/admin/employees" component={Employees} />
      <Route path="/dashboard/admin/settings" component={SettingsPage} />
      <Route path="/dashboard/admin/lifecycle" component={Lifecycle} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
