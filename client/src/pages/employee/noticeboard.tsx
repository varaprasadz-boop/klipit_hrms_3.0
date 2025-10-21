import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, Bell, AlertCircle, Info, CheckCircle
} from "lucide-react";
import { format } from "date-fns";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

const mockNotices = [
  {
    id: "1",
    title: "Holiday Notice - Diwali",
    content: "The office will be closed on November 1st for Diwali celebration. Enjoy the festival with your family!",
    category: "holiday",
    priority: "normal",
    postedOn: "2025-10-20",
    postedBy: "HR Department",
  },
  {
    id: "2",
    title: "Upcoming Company Event",
    content: "Join us for our annual team building event on November 15th. Location and timing details will be shared soon.",
    category: "event",
    priority: "high",
    postedOn: "2025-10-19",
    postedBy: "Admin",
  },
  {
    id: "3",
    title: "System Maintenance",
    content: "Our HRMS system will undergo maintenance this weekend. Please complete your pending tasks by Friday.",
    category: "announcement",
    priority: "urgent",
    postedOn: "2025-10-18",
    postedBy: "IT Department",
  },
  {
    id: "4",
    title: "New Policy Update",
    content: "The updated work from home policy is now available. Please review the new guidelines in the employee handbook.",
    category: "policy",
    priority: "normal",
    postedOn: "2025-10-15",
    postedBy: "HR Department",
  },
];

export default function EmployeeNoticeboardPage() {
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      holiday: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      event: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      announcement: "bg-green-500/10 text-green-600 dark:text-green-400",
      policy: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    };
    return (
      <Badge variant="outline" className={colors[category] || "bg-gray-500/10 text-gray-600 dark:text-gray-400"}>
        <span className="capitalize">{category}</span>
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "high":
        return <Bell className="h-5 w-5 text-orange-500" />;
      case "normal":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Noticeboard</h2>
          <p className="text-muted-foreground">Company announcements and updates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{mockNotices.length}</div>
              <p className="text-xs text-muted-foreground">Active notices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-urgent">
                {mockNotices.filter(n => n.priority === "urgent").length}
              </div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-events">
                {mockNotices.filter(n => n.category === "event").length}
              </div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-week">
                {mockNotices.filter(n => new Date(n.postedOn) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <p className="text-xs text-muted-foreground">New notices</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notices</CardTitle>
            <CardDescription>Stay updated with company announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {mockNotices.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-notices">No notices available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockNotices.map((notice) => (
                  <Card key={notice.id} data-testid={`notice-${notice.id}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(notice.priority)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{notice.title}</h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {getCategoryBadge(notice.category)}
                                  <span className="text-xs text-muted-foreground">
                                    Posted by {notice.postedBy} • {format(new Date(notice.postedOn), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notice.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
