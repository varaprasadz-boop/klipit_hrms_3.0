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

// Mock leave data - replace with actual API
const mockLeaveRequests = [
  {
    id: "1",
    leaveType: "Annual Leave",
    fromDate: "2025-11-01",
    toDate: "2025-11-05",
    days: 5,
    reason: "Family vacation",
    status: "pending",
    appliedOn: "2025-10-21",
  },
  {
    id: "2",
    leaveType: "Sick Leave",
    fromDate: "2025-10-15",
    toDate: "2025-10-16",
    days: 2,
    reason: "Medical appointment",
    status: "approved",
    appliedOn: "2025-10-10",
    approvedOn: "2025-10-11",
  },
];

export default function EmployeeLeavePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [open, setOpen] = useState(false);

  const leaveBalance = {
    annual: 18,
    sick: 10,
    casual: 5,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1">
                    <option>Annual Leave</option>
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Enter reason for leave..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button data-testid="button-submit-leave">Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
              <Umbrella className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="balance-annual">{leaveBalance.annual}</div>
              <p className="text-xs text-muted-foreground">days remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
              <Umbrella className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="balance-sick">{leaveBalance.sick}</div>
              <p className="text-xs text-muted-foreground">days remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
              <Umbrella className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="balance-casual">{leaveBalance.casual}</div>
              <p className="text-xs text-muted-foreground">days remaining</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>Track your leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            {mockLeaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <Umbrella className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-leaves">No leave requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockLeaveRequests.map((leave) => (
                  <Card key={leave.id} data-testid={`leave-${leave.id}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{leave.leaveType}</h4>
                              {getStatusBadge(leave.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(leave.fromDate), "MMM dd")} - {format(new Date(leave.toDate), "MMM dd, yyyy")} ({leave.days} {leave.days === 1 ? "day" : "days"})
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Reason</p>
                          <p className="mt-1">{leave.reason}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Applied on {format(new Date(leave.appliedOn), "MMM dd, yyyy")}
                          {leave.approvedOn && ` • Approved on ${format(new Date(leave.approvedOn), "MMM dd, yyyy")}`}
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
