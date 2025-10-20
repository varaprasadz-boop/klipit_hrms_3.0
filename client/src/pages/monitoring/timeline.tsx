import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, Target, MapPin, LogIn, LogOut, Coffee
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

const timelineData = [
  {
    id: 1,
    employee: "John Doe",
    events: [
      { type: "check-in", time: "09:00 AM", location: "Mumbai Office", icon: LogIn },
      { type: "break", time: "11:30 AM", duration: "15 mins", icon: Coffee },
      { type: "location", time: "02:15 PM", location: "Client Meeting - Andheri", icon: MapPin },
      { type: "check-out", time: "06:00 PM", location: "Mumbai Office", icon: LogOut },
    ]
  },
  {
    id: 2,
    employee: "Sarah Smith",
    events: [
      { type: "check-in", time: "08:45 AM", location: "Delhi Branch", icon: LogIn },
      { type: "break", time: "12:00 PM", duration: "45 mins", icon: Coffee },
      { type: "location", time: "03:30 PM", location: "HR Department", icon: MapPin },
    ]
  },
  {
    id: 3,
    employee: "Mike Johnson",
    events: [
      { type: "check-in", time: "09:15 AM", location: "Pune Office", icon: LogIn },
      { type: "location", time: "11:00 AM", location: "Client Site - Hinjewadi", icon: MapPin },
      { type: "break", time: "01:00 PM", duration: "30 mins", icon: Coffee },
      { type: "location", time: "04:00 PM", location: "Return to Office", icon: MapPin },
    ]
  },
];

export default function Timeline() {
  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Employee Timeline</h2>
          <p className="text-muted-foreground">Track employee activities throughout the day</p>
        </div>

        <div className="space-y-6">
          {timelineData.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{employee.employee}</CardTitle>
                    <CardDescription>Today's Activity Log</CardDescription>
                  </div>
                  <Badge>{employee.events.length} Events</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {employee.events.map((event, index) => {
                      const Icon = event.icon;
                      return (
                        <div key={index} className="relative flex items-start gap-4 pl-0">
                          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 pt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-lg">{event.time}</span>
                              <Badge variant="outline">
                                {event.type === 'check-in' && 'Check In'}
                                {event.type === 'check-out' && 'Check Out'}
                                {event.type === 'break' && 'Break'}
                                {event.type === 'location' && 'Location Update'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.location && `Location: ${event.location}`}
                              {event.duration && `Duration: ${event.duration}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
