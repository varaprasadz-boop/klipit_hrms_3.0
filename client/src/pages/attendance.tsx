import DashboardLayout from "@/components/DashboardLayout";
import AttendanceWidget from "@/components/AttendanceWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, LayoutDashboard, Users, Umbrella, Workflow, Receipt, Megaphone, FileText, UserPlus, Shield, BarChart3, Settings } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
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
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

// todo: remove mock functionality
const attendanceHistory = [
  { date: "Jan 15, 2024", clockIn: "09:00 AM", clockOut: "06:00 PM", status: "Present" },
  { date: "Jan 14, 2024", clockIn: "09:15 AM", clockOut: "06:10 PM", status: "Present" },
  { date: "Jan 13, 2024", clockIn: "09:05 AM", clockOut: "06:00 PM", status: "Present" },
  { date: "Jan 12, 2024", clockIn: "—", clockOut: "—", status: "Weekend" },
];

export default function Attendance() {
  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Attendance Management</h2>
          <p className="text-muted-foreground">Track and manage employee attendance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AttendanceWidget />
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceHistory.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-md border hover-elevate">
                      <div className="flex-1">
                        <p className="font-medium">{record.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.clockIn} - {record.clockOut}
                        </p>
                      </div>
                      <Badge variant={record.status === "Present" ? "default" : "secondary"}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
