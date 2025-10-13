import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import WorkflowKanban from "@/components/WorkflowKanban";
import NoticeboardFeed from "@/components/NoticeboardFeed";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, CalendarCheck, UserCheck 
} from "lucide-react";

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

export default function AdminDashboard() {
  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your company overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Employees"
            value="245"
            icon={Users}
            description="Active employees"
            trend={{ value: "12% from last month", positive: true }}
          />
          <StatsCard
            title="Present Today"
            value="238"
            icon={UserCheck}
            description="97% attendance"
            trend={{ value: "3% from yesterday", positive: true }}
          />
          <StatsCard
            title="Leave Requests"
            value="8"
            icon={CalendarCheck}
            description="Pending approvals"
          />
          <StatsCard
            title="Open Workflows"
            value="15"
            icon={Workflow}
            description="Require action"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Pending Workflows</h3>
            <WorkflowKanban />
          </div>
          <div>
            <NoticeboardFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
