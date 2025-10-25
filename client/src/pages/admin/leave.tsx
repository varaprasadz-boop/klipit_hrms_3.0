import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, Target, Building2, Star, DollarSign,
  Search, Calendar, CheckCircle, XCircle, AlertCircle, Clock3
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LeaveRequest, User, Department, LeaveType } from "@shared/schema";

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

export default function LeavePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  const { data: leaveRequests = [], isLoading: loadingRequests } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: leaveTypes = [] } = useQuery<LeaveType[]>({
    queryKey: ["/api/leave-types"],
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest("PATCH", `/api/leave-requests/${requestId}`, {
        status: "approved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({ title: "Leave request approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve leave request", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/leave-requests/${requestId}`, {
        status: "rejected",
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({ title: "Leave request rejected" });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequestId(null);
    },
    onError: () => {
      toast({ title: "Failed to reject leave request", variant: "destructive" });
    },
  });

  const handleApprove = (requestId: string) => {
    approveMutation.mutate(requestId);
  };

  const handleRejectClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!selectedRequestId) return;
    if (!rejectionReason.trim()) {
      toast({ title: "Please provide a rejection reason", variant: "destructive" });
      return;
    }
    rejectMutation.mutate({ requestId: selectedRequestId, reason: rejectionReason });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  const getDepartmentName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee || !employee.departmentId) return "N/A";
    const department = departments.find(d => d.id === employee.departmentId);
    return department?.name || "N/A";
  };

  const getLeaveTypeName = (leaveTypeId: string) => {
    const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
    return leaveType?.name || "Unknown";
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

  const filteredRequests = leaveRequests.filter(request => {
    const employeeName = getEmployeeName(request.employeeId);
    const department = getDepartmentName(request.employeeId);
    const leaveTypeName = getLeaveTypeName(request.leaveTypeId);
    
    const matchesSearch = 
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesLeaveType = leaveTypeFilter === "all" || request.leaveTypeId === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesLeaveType;
  });

  const pendingRequests = filteredRequests.filter(r => r.status === "pending");
  const approvedRequests = filteredRequests.filter(r => r.status === "approved");
  const rejectedRequests = filteredRequests.filter(r => r.status === "rejected");

  const approvedToday = leaveRequests.filter(r => 
    r.status === "approved" && 
    r.approvedOn && 
    format(new Date(r.approvedOn), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;

  const renderLeaveCard = (request: LeaveRequest) => (
    <Card key={request.id} data-testid={`leave-card-${request.id}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold" data-testid={`leave-employee-${request.id}`}>
                  {getEmployeeName(request.employeeId)}
                </h4>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getDepartmentName(request.employeeId)} • {getLeaveTypeName(request.leaveTypeId)}
              </p>
            </div>
            {request.status === "pending" && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  onClick={() => handleApprove(request.id)}
                  disabled={approveMutation.isPending}
                  data-testid={`button-approve-${request.id}`}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  onClick={() => handleRejectClick(request.id)}
                  disabled={rejectMutation.isPending}
                  data-testid={`button-reject-${request.id}`}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">From Date</p>
              <p className="font-medium">{format(new Date(request.fromDate), "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">To Date</p>
              <p className="font-medium">{format(new Date(request.toDate), "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{request.days} {request.days === 1 ? "day" : "days"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Applied On</p>
              <p className="font-medium">{format(new Date(request.appliedOn), "MMM dd, yyyy")}</p>
            </div>
          </div>

          {request.reason && (
            <div className="text-sm">
              <p className="text-muted-foreground">Reason</p>
              <p className="mt-1">{request.reason}</p>
            </div>
          )}

          {request.status === "approved" && request.approvedOn && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Approved on {format(new Date(request.approvedOn), "MMM dd, yyyy")}
            </div>
          )}

          {request.status === "rejected" && request.rejectedOn && (
            <div className="text-sm">
              <p className="text-red-600 dark:text-red-400">
                Rejected on {format(new Date(request.rejectedOn), "MMM dd, yyyy")}
              </p>
              {request.rejectionReason && (
                <p className="text-muted-foreground mt-1">Reason: {request.rejectionReason}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Leave Management</h2>
          <p className="text-muted-foreground">Review and manage employee leave requests</p>
        </div>

        {loadingRequests ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Loading leave requests...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-pending">{pendingRequests.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-approved">{approvedToday}</div>
                  <p className="text-xs text-muted-foreground">Approved requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                  <Umbrella className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-approved">{approvedRequests.length}</div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-rejection-rate">
                    {leaveRequests.length > 0 
                      ? Math.round((rejectedRequests.length / leaveRequests.length) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">{rejectedRequests.length} rejected</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>Manage all employee leave applications</CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-4 flex-wrap mt-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        data-testid="input-search"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-leave-type">
                      <SelectValue placeholder="Leave Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id}>
                          {lt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" data-testid="tab-all">
                      All ({filteredRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" data-testid="tab-pending">
                      Pending ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" data-testid="tab-approved">
                      Approved ({approvedRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" data-testid="tab-rejected">
                      Rejected ({rejectedRequests.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3 mt-4">
                    {filteredRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <Umbrella className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground" data-testid="text-no-requests">No leave requests found</p>
                      </div>
                    ) : (
                      filteredRequests.map(renderLeaveCard)
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-3 mt-4">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No pending requests</p>
                      </div>
                    ) : (
                      pendingRequests.map(renderLeaveCard)
                    )}
                  </TabsContent>

                  <TabsContent value="approved" className="space-y-3 mt-4">
                    {approvedRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No approved requests</p>
                      </div>
                    ) : (
                      approvedRequests.map(renderLeaveCard)
                    )}
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-3 mt-4">
                    {rejectedRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No rejected requests</p>
                      </div>
                    ) : (
                      rejectedRequests.map(renderLeaveCard)
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                data-testid="textarea-rejection-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
