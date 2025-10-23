import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import WorkflowKanban from "@/components/WorkflowKanban";
import NoticeboardFeed from "@/components/NoticeboardFeed";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, CalendarCheck, UserCheck,
  Target, MapPin, Timer, LayoutGrid, Building2, Briefcase, Star, DollarSign
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

export default function AdminDashboard() {
  const { data: employees = [], isLoading: employeesLoading } = useQuery({ 
    queryKey: ['/api/employees'] 
  });

  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({ 
    queryKey: ['/api/attendance-records'] 
  });

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({ 
    queryKey: ['/api/workflows'] 
  });

  // Note: Leave requests endpoint not implemented yet, will show 0 until API is ready
  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery({ 
    queryKey: ['/api/leave-requests'],
    retry: false,
    // Will fail gracefully until endpoint is implemented
  });

  // Calculate stats
  const totalEmployees = employees.length;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const presentToday = attendanceRecords.filter((record: any) => 
    record.date === today && record.status === 'present'
  ).length;
  
  const attendancePercentage = totalEmployees > 0 
    ? Math.round((presentToday / totalEmployees) * 100) 
    : 0;

  const pendingWorkflows = workflows.filter((w: any) => 
    w.status === 'pending' || w.status === 'in_progress'
  ).length;

  const pendingLeaveRequests = leaveRequests.filter((l: any) => 
    l.status === 'pending'
  ).length;

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
            value={employeesLoading ? "..." : totalEmployees.toString()}
            icon={Users}
            description="Active employees"
          />
          <StatsCard
            title="Present Today"
            value={attendanceLoading ? "..." : presentToday.toString()}
            icon={UserCheck}
            description={`${attendancePercentage}% attendance`}
          />
          <StatsCard
            title="Leave Requests"
            value={leaveLoading ? "..." : pendingLeaveRequests.toString()}
            icon={CalendarCheck}
            description="Pending approvals"
          />
          <StatsCard
            title="Open Workflows"
            value={workflowsLoading ? "..." : pendingWorkflows.toString()}
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
