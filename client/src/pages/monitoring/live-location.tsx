import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, Target, MapPin, Navigation
} from "lucide-react";

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
  { title: "Employees", url: "/dashboard/admin/employees", icon: Users },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/admin/leave", icon: Umbrella },
  { title: "Workflows", url: "/dashboard/admin/workflows", icon: Workflow },
  { title: "Expenses", url: "/dashboard/admin/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/admin/noticeboard", icon: Megaphone },
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

const employees = [
  {
    id: 1,
    name: "John Doe",
    position: "Senior Developer",
    location: "Mumbai Office",
    coordinates: "19.0760° N, 72.8777° E",
    status: "active",
    lastUpdate: "2 mins ago"
  },
  {
    id: 2,
    name: "Sarah Smith",
    position: "HR Manager",
    location: "Delhi Branch",
    coordinates: "28.7041° N, 77.1025° E",
    status: "active",
    lastUpdate: "5 mins ago"
  },
  {
    id: 3,
    name: "Mike Johnson",
    position: "Sales Executive",
    location: "Client Site - Pune",
    coordinates: "18.5204° N, 73.8567° E",
    status: "active",
    lastUpdate: "1 min ago"
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "Marketing Lead",
    location: "Bangalore Office",
    coordinates: "12.9716° N, 77.5946° E",
    status: "idle",
    lastUpdate: "15 mins ago"
  },
  {
    id: 5,
    name: "David Wilson",
    position: "Product Manager",
    location: "Hyderabad Office",
    coordinates: "17.3850° N, 78.4867° E",
    status: "active",
    lastUpdate: "3 mins ago"
  },
];

export default function LiveLocation() {
  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Live Location Tracking</h2>
            <p className="text-muted-foreground">Real-time employee location monitoring</p>
          </div>
          <Badge className="bg-green-600 text-lg px-4 py-2">
            {employees.filter(e => e.status === 'active').length} Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
                <CardDescription>Employee locations on map</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Map integration will be displayed here</p>
                    <p className="text-sm text-muted-foreground">Google Maps / OpenStreetMap</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Employees</CardTitle>
                <CardDescription>Currently tracked locations</CardDescription>
                <Input placeholder="Search employees..." className="mt-2" data-testid="input-search-employees" />
              </CardHeader>
              <CardContent className="space-y-3">
                {employees.map((employee) => (
                  <div 
                    key={employee.id}
                    className="p-3 border rounded-lg hover-elevate cursor-pointer"
                    data-testid={`card-employee-${employee.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-xs text-muted-foreground">{employee.position}</p>
                      </div>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {employee.status}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Navigation className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{employee.location}</p>
                        <p className="text-xs text-muted-foreground">{employee.coordinates}</p>
                        <p className="text-xs text-muted-foreground mt-1">Updated {employee.lastUpdate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
