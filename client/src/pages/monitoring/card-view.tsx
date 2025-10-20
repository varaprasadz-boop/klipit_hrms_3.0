import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, Target, MapPin, Timer, Activity
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
    status: "active",
    checkIn: "09:00 AM",
    location: "Mumbai Office",
    workHours: "7h 30m",
    productivity: 92
  },
  {
    id: 2,
    name: "Sarah Smith",
    position: "HR Manager",
    status: "active",
    checkIn: "08:45 AM",
    location: "Delhi Branch",
    workHours: "8h 15m",
    productivity: 88
  },
  {
    id: 3,
    name: "Mike Johnson",
    position: "Sales Executive",
    status: "active",
    checkIn: "09:15 AM",
    location: "Client Site - Pune",
    workHours: "6h 45m",
    productivity: 85
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "Marketing Lead",
    status: "break",
    checkIn: "09:00 AM",
    location: "Bangalore Office",
    workHours: "7h 00m",
    productivity: 90
  },
  {
    id: 5,
    name: "David Wilson",
    position: "Product Manager",
    status: "active",
    checkIn: "08:30 AM",
    location: "Hyderabad Office",
    workHours: "8h 30m",
    productivity: 95
  },
  {
    id: 6,
    name: "Lisa Anderson",
    position: "UX Designer",
    status: "offline",
    checkIn: "-",
    location: "-",
    workHours: "0h 00m",
    productivity: 0
  },
];

export default function CardView() {
  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Employee Card View</h2>
            <p className="text-muted-foreground">Quick overview of all employee activities</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-600">{employees.filter(e => e.status === 'active').length} Active</Badge>
            <Badge variant="secondary">{employees.filter(e => e.status === 'break').length} On Break</Badge>
            <Badge variant="outline">{employees.filter(e => e.status === 'offline').length} Offline</Badge>
          </div>
        </div>

        <div className="mb-6">
          <Input placeholder="Search employees..." className="max-w-md" data-testid="input-search-employees" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover-elevate" data-testid={`card-employee-${employee.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      employee.status === 'active' ? 'default' : 
                      employee.status === 'break' ? 'secondary' : 
                      'outline'
                    }
                    className={employee.status === 'active' ? 'bg-green-600' : ''}
                  >
                    {employee.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Check In</span>
                    </div>
                    <p className="font-semibold">{employee.checkIn}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      <span className="text-xs">Work Hours</span>
                    </div>
                    <p className="font-semibold">{employee.workHours}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">Location</span>
                  </div>
                  <p className="text-sm font-medium">{employee.location}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span className="text-xs">Productivity</span>
                    </div>
                    <span className="text-sm font-semibold">{employee.productivity}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${employee.productivity}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
