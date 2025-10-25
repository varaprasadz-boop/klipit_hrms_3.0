import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import type { LeaveRequest, ExpenseClaim, User, LeaveType, ExpenseType } from "@shared/schema";
import { format } from "date-fns";

export default function WorkflowKanban() {
  const [, setLocation] = useLocation();

  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const { data: expenseClaims = [] } = useQuery<ExpenseClaim[]>({
    queryKey: ["/api/expense-claims"],
  });

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  const { data: leaveTypes = [] } = useQuery<LeaveType[]>({
    queryKey: ["/api/leave-types"],
  });

  const { data: expenseTypes = [] } = useQuery<ExpenseType[]>({
    queryKey: ["/api/expense-types"],
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const getLeaveTypeName = (leaveTypeId: string) => {
    const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
    return leaveType?.name || "Leave";
  };

  const getExpenseTypeName = (expenseTypeId: string | null) => {
    if (!expenseTypeId) return "Expense";
    const expenseType = expenseTypes.find(et => et.id === expenseTypeId);
    return expenseType?.name || "Expense";
  };

  // Convert leave requests to workflow items
  const leaveWorkflows = leaveRequests.map(leave => ({
    id: leave.id,
    title: `${getLeaveTypeName(leave.leaveTypeId)} - ${getEmployeeName(leave.employeeId)}`,
    subtitle: `${format(new Date(leave.fromDate), "MMM dd")} - ${format(new Date(leave.toDate), "MMM dd")} (${leave.days} days)`,
    status: leave.status,
    type: "leave",
  }));

  // Convert expense claims to workflow items
  const expenseWorkflows = expenseClaims.map(expense => ({
    id: expense.id,
    title: `${getExpenseTypeName(expense.expenseTypeId)} - ₹${expense.totalAmount?.toLocaleString() || 0}`,
    subtitle: getEmployeeName(expense.employeeId),
    status: expense.status,
    type: "expense",
  }));

  // Combine all workflows
  const allWorkflows = [...leaveWorkflows, ...expenseWorkflows];

  const pending = allWorkflows.filter(w => w.status === "pending");
  const approved = allWorkflows.filter(w => w.status === "approved");
  const rejected = allWorkflows.filter(w => w.status === "rejected");

  const handleView = (type: string) => {
    if (type === "leave") {
      setLocation("/dashboard/admin/leave");
    } else if (type === "expense") {
      setLocation("/dashboard/admin/expense-dashboard");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pending ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pending approvals</p>
          ) : (
            pending.map(item => (
              <Card key={item.id} className="p-3" data-testid={`pending-workflow-${item.id}`}>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleView(item.type)}
                      data-testid={`button-view-${item.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Approved ({approved.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {approved.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No approved items</p>
          ) : (
            approved.slice(0, 5).map(item => (
              <Card key={item.id} className="p-3 bg-primary/5" data-testid={`approved-workflow-${item.id}`}>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                <Badge variant="default" className="text-xs mt-2">{item.type}</Badge>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <XCircle className="h-4 w-4 text-destructive" />
            Rejected ({rejected.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rejected.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No rejected items</p>
          ) : (
            rejected.slice(0, 5).map(item => (
              <Card key={item.id} className="p-3 bg-destructive/5" data-testid={`rejected-workflow-${item.id}`}>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                <Badge variant="secondary" className="text-xs mt-2">{item.type}</Badge>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
