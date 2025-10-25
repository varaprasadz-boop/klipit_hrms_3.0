import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, Target, MapPin, Navigation, Building2, Star, DollarSign, AlertCircle
} from "lucide-react";
import { useState } from "react";
import type { User, Department, Designation } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { 
    title: "Monitoring", 
    icon: Target,
    subItems: [
      { title: "Live Location", url: "/dashboard/admin/monitoring/live-location" },
      { title: "Time Line", url: "/dashboard/admin/monitoring/timeline" },
      { title: "Card View", url: "/dashboard/admin/monitoring/card-view" },
    ]
  },
  { 
    title: "Organization", 
    icon: Building2,
    subItems: [
      { title: "Employees", url: "/dashboard/admin/organization/employees" },
      { title: "Departments", url: "/dashboard/admin/organization/departments" },
      { title: "Designations", url: "/dashboard/admin/organization/designations" },
      { title: "Roles & Levels", url: "/dashboard/admin/organization/roles-levels" },
    ]
  },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/admin/leave", icon: Umbrella },
  { title: "Workflows", url: "/dashboard/admin/workflows", icon: Workflow },
  { title: "Expense Dashboard", url: "/dashboard/admin/expense-dashboard", icon: Receipt },
  { 
    title: "Masters", 
    icon: Star,
    subItems: [
      { title: "Shifts", url: "/dashboard/admin/masters/shifts" },
      { title: "Holidays", url: "/dashboard/admin/masters/holidays" },
      { title: "Leave Types", url: "/dashboard/admin/masters/leave-types" },
      { title: "Expense Types", url: "/dashboard/admin/masters/expense-types" },
    ]
  },
  { title: "Noticeboard", url: "/dashboard/admin/noticeboard", icon: Megaphone },
  { title: "Payroll", url: "/dashboard/admin/payroll", icon: DollarSign },
  { title: "Payslips", url: "/dashboard/admin/payslips", icon: FileText },
  { title: "Lifecycle", url: "/dashboard/admin/lifecycle", icon: UserPlus },
  { title: "Roles", url: "/dashboard/admin/roles", icon: Shield },
  { title: "Reports", url: "/dashboard/admin/reports", icon: BarChart3 },
  { 
    title: "Settings", 
    icon: Settings,
    subItems: [
      { title: "Company Info", url: "/dashboard/admin/settings/company-info" },
      { title: "Email SMTP", url: "/dashboard/admin/settings/email-smtp" },
      { title: "Contact Info", url: "/dashboard/admin/settings/contact-info" },
      { title: "Package Details", url: "/dashboard/admin/settings/package-details" },
    ]
  },
];

export default function LiveLocation() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: designations = [] } = useQuery<Designation[]>({
    queryKey: ["/api/designations"],
  });

  const activeEmployees = employees.filter(emp => emp.status === "active");

  const filteredEmployees = activeEmployees.filter(emp => {
    const fullName = emp.name.toLowerCase();
    const position = (emp.position || "").toLowerCase();
    const department = (emp.department || "").toLowerCase();
    
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      position.includes(searchQuery.toLowerCase()) ||
      department.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold mb-1">Live Location Tracking</h2>
            <p className="text-muted-foreground">Real-time employee location monitoring</p>
          </div>
          <Badge className="bg-green-600 text-lg px-4 py-2">
            {activeEmployees.length} Active Employees
          </Badge>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>GPS Tracking Infrastructure Required</AlertTitle>
          <AlertDescription>
            Live location tracking requires GPS-enabled mobile application and backend infrastructure for real-time location updates. 
            This feature shows active employees but location data integration is not yet implemented. 
            Implementation would require: (1) Mobile app with GPS permissions, (2) Location tracking service, 
            (3) Real-time data sync, (4) Map integration (Google Maps/OpenStreetMap).
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
                <CardDescription>Employee locations will be displayed on map once GPS tracking is integrated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Map integration pending</p>
                    <p className="text-sm text-muted-foreground">Requires GPS tracking infrastructure</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Employees</CardTitle>
                <CardDescription>{activeEmployees.length} employees currently active</CardDescription>
                <Input 
                  placeholder="Search employees..." 
                  className="mt-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-employees" 
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading employees...</p>
                ) : filteredEmployees.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? "No employees match your search" : "No active employees"}
                  </p>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div 
                      key={employee.id}
                      className="p-3 border rounded-lg hover-elevate cursor-pointer"
                      data-testid={`card-employee-${employee.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-xs text-muted-foreground">{employee.position || "Employee"}</p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          active
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Navigation className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{employee.department || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">Location tracking not enabled</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
