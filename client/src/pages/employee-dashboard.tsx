import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import AttendanceWidget from "@/components/AttendanceWidget";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import PayslipsList from "@/components/PayslipsList";
import NoticeboardFeed from "@/components/NoticeboardFeed";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, CalendarDays, CheckCircle2 
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

export default function EmployeeDashboard() {
  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">My Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, John Doe!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Leave Balance"
            value="18 days"
            icon={CalendarDays}
            description="Available this year"
          />
          <StatsCard
            title="Attendance"
            value="96%"
            icon={CheckCircle2}
            description="This month"
            trend={{ value: "2% from last month", positive: true }}
          />
          <StatsCard
            title="Pending Claims"
            value="2"
            icon={Receipt}
            description="Under review"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <AttendanceWidget />
            <NoticeboardFeed />
          </div>
          <div className="space-y-6">
            <LeaveRequestForm />
          </div>
          <div>
            <PayslipsList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
