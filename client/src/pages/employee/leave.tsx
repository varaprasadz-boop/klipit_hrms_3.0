import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, CalendarDays, Plus,
  CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LeaveRequest, LeaveBalance, LeaveType } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

export default function EmployeeLeavePage() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const { data: leaveRequests = [], isLoading: loadingRequests } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const { data: leaveBalances = [], isLoading: loadingBalances } = useQuery<LeaveBalance[]>({
    queryKey: ["/api/leave-balances"],
  });

  const { data: leaveTypes = [] } = useQuery<LeaveType[]>({
    queryKey: ["/api/leave-types"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const fromDate = new Date(data.fromDate);
      const toDate = new Date(data.toDate);
      const days = differenceInDays(toDate, fromDate) + 1;

      return await apiRequest("POST", "/api/leave-requests", {
        ...data,
        days,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({ title: "Leave request submitted successfully" });
      setFormData({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
      setOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to submit leave request", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!formData.leaveTypeId || !formData.fromDate || !formData.toDate) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast({ title: "From date must be before to date", variant: "destructive" });
      return;
    }

    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeName = (leaveTypeId: string) => {
    const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
    return leaveType?.name || "Unknown";
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">My Leave</h2>
            <p className="text-muted-foreground">Manage your leave requests and balance</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-apply-leave">
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>Submit a new leave request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select
                    value={formData.leaveTypeId}
                    onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                  >
                    <SelectTrigger data-testid="select-leave-type">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id}>
                          {lt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      data-testid="input-from-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input
                      type="date"
                      value={formData.toDate}
                      onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                      data-testid="input-to-date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Enter reason for leave..."
                    rows={3}
                    value={formData.reason || ""}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    data-testid="textarea-reason"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  data-testid="button-submit-leave"
                >
                  {createMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingBalances ? (
            <div className="col-span-3 text-center text-sm text-muted-foreground py-4">
              Loading leave balances...
            </div>
          ) : leaveBalances.length === 0 ? (
            <div className="col-span-3 text-center text-sm text-muted-foreground py-4">
              No leave balances configured. Contact your admin.
            </div>
          ) : (
            leaveBalances.map((balance) => (
              <Card key={balance.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {getLeaveTypeName(balance.leaveTypeId)}
                  </CardTitle>
                  <Umbrella className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`balance-${balance.leaveTypeId}`}>
                    {balance.remainingDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {balance.totalDays} days remaining
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>Track your leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Loading leave requests...
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <Umbrella className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-leaves">No leave requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.map((leave) => (
                  <Card key={leave.id} data-testid={`leave-${leave.id}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{getLeaveTypeName(leave.leaveTypeId)}</h4>
                              {getStatusBadge(leave.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(leave.fromDate), "MMM dd")} - {format(new Date(leave.toDate), "MMM dd, yyyy")} ({leave.days} {leave.days === 1 ? "day" : "days"})
                            </p>
                          </div>
                        </div>
                        {leave.reason && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Reason</p>
                            <p className="mt-1">{leave.reason}</p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Applied on {format(new Date(leave.appliedOn), "MMM dd, yyyy")}
                          {leave.approvedOn && ` • Approved on ${format(new Date(leave.approvedOn), "MMM dd, yyyy")}`}
                          {leave.rejectedOn && ` • Rejected on ${format(new Date(leave.rejectedOn), "MMM dd, yyyy")}`}
                        </div>
                        {leave.rejectionReason && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Rejection Reason</p>
                            <p className="mt-1 text-destructive">{leave.rejectionReason}</p>
                          </div>
                        )}
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
