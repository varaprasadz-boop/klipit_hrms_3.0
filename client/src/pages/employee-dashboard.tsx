import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import AttendanceWidget from "@/components/AttendanceWidget";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import PayslipsList from "@/components/PayslipsList";
import NoticeboardFeed from "@/components/NoticeboardFeed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Workflow } from "@shared/schema";
import { format } from "date-fns";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, CalendarDays, CheckCircle2, 
  Target, AlertCircle, Calendar
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
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  // CRITICAL: Filter to only show workflows assigned to the logged-in user
  const myWorkflows = workflows.filter((w) => 
    w.assignedTo === user.id && 
    w.status !== "completed" && 
    w.status !== "cancelled"
  );
  const urgentWorkflows = myWorkflows.filter((w) => {
    const daysUntilDeadline = Math.ceil(
      (new Date(w.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline <= 3 && daysUntilDeadline >= 0;
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      return await apiRequest(`/api/workflows/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ progress }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Progress updated",
        description: "Your progress has been updated successfully.",
      });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/workflows/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed", progress: 100 }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Task completed",
        description: "Great job! Task marked as completed.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "medium":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "high":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "urgent":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">My Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, John Doe!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <StatsCard
            title="My Tasks"
            value={myWorkflows.length.toString()}
            icon={Target}
            description={`${urgentWorkflows.length} urgent`}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>My TODO List</CardTitle>
                <CardDescription>Your assigned tasks and targets</CardDescription>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {workflowsLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
            ) : myWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-todos">
                  No pending tasks. You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myWorkflows.map((workflow) => {
                  const daysUntilDeadline = Math.ceil(
                    (new Date(workflow.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isOverdue = daysUntilDeadline < 0;
                  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

                  return (
                    <Card key={workflow.id} data-testid={`todo-item-${workflow.id}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold" data-testid={`todo-title-${workflow.id}`}>
                                  {workflow.title}
                                </h4>
                                <Badge variant="outline" className={getPriorityColor(workflow.priority)}>
                                  <span className="capitalize">{workflow.priority}</span>
                                </Badge>
                                <Badge variant="outline">
                                  <span className="capitalize">{workflow.type}</span>
                                </Badge>
                              </div>
                              {workflow.description && (
                                <p className="text-sm text-muted-foreground">{workflow.description}</p>
                              )}
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span className={isOverdue ? "text-red-600 dark:text-red-400 font-medium" : isUrgent ? "text-orange-600 dark:text-orange-400 font-medium" : ""}>
                                  Due: {format(new Date(workflow.deadline), "MMM dd, yyyy")}
                                  {isOverdue && " (Overdue)"}
                                  {isUrgent && !isOverdue && " (Urgent)"}
                                </span>
                              </div>
                            </div>
                            {workflow.progress === 100 ? (
                              <Button
                                size="sm"
                                onClick={() => markCompleteMutation.mutate(workflow.id)}
                                disabled={markCompleteMutation.isPending}
                                data-testid={`button-complete-${workflow.id}`}
                              >
                                Mark Complete
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newProgress = Math.min(workflow.progress + 25, 100);
                                  updateProgressMutation.mutate({ id: workflow.id, progress: newProgress });
                                }}
                                disabled={updateProgressMutation.isPending}
                                data-testid={`button-update-progress-${workflow.id}`}
                              >
                                +25% Progress
                              </Button>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium" data-testid={`todo-progress-${workflow.id}`}>
                                {workflow.progress}%
                              </span>
                            </div>
                            <Progress value={workflow.progress} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
