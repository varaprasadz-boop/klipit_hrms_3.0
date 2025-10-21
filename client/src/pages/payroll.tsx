import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, Send, Eye, Trash2, DollarSign, Users, TrendingUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PayrollRecord, Employee, Department, PayrollItem } from "@shared/schema";
import { 
  LayoutDashboard, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings,
  Target, Building2, Star, Banknote
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
      { title: "CTC Components", url: "/dashboard/admin/organization/ctc-components" },
    ]
  },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/admin/leave", icon: Umbrella },
  { title: "Workflows", url: "/dashboard/admin/workflows", icon: Workflow },
  { title: "Expenses", url: "/dashboard/admin/expenses", icon: Receipt },
  { title: "Payroll", url: "/dashboard/admin/payroll", icon: Banknote },
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

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    case "approved":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
  }
};

function GeneratePayrollDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: employees, isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payroll/generate", {
        month: selectedMonth,
        year: selectedYear,
        employeeIds: selectedEmployeeIds,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: data.message || "Payroll generated successfully",
      });
      onOpenChange(false);
      setSelectedEmployeeIds([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate payroll",
        variant: "destructive",
      });
    },
  });

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleAll = () => {
    if (selectedEmployeeIds.length === (employees?.length || 0)) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees?.map(e => e.id) || []);
    }
  };

  const handleGenerate = () => {
    if (selectedEmployeeIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one employee",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle data-testid="text-generate-payroll-title">Generate Payroll</DialogTitle>
          <DialogDescription>
            Select the month, year, and employees for payroll generation
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                <SelectTrigger data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Employees</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleAll}
                data-testid="button-toggle-all-employees"
              >
                {selectedEmployeeIds.length === (employees?.length || 0) ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="border rounded-md max-h-64 overflow-y-auto p-2 space-y-2">
              {employeesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                employees?.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2 p-2 hover-elevate rounded-md">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                      data-testid={`checkbox-employee-${employee.id}`}
                    />
                    <Label 
                      htmlFor={`employee-${employee.id}`} 
                      className="flex-1 cursor-pointer"
                    >
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </Label>
                  </div>
                ))
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedEmployeeIds.length} employee(s) selected
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-generate"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={generateMutation.isPending || selectedEmployeeIds.length === 0}
            data-testid="button-confirm-generate"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Payroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApproveRejectDialog({
  open,
  onOpenChange,
  payroll,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollRecord | null;
  action: "approve" | "reject";
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!payroll) return;
      const endpoint = action === "approve" ? `/api/payroll/${payroll.id}/approve` : `/api/payroll/${payroll.id}/reject`;
      const body = action === "reject" ? { reason: rejectionReason } : undefined;
      const res = await apiRequest("PUT", endpoint, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: `Payroll ${action === "approve" ? "approved" : "rejected"} successfully`,
      });
      onOpenChange(false);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} payroll`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle data-testid={`text-${action}-payroll-title`}>
            {action === "approve" ? "Approve Payroll" : "Reject Payroll"}
          </DialogTitle>
          <DialogDescription>
            {action === "approve" 
              ? "Are you sure you want to approve this payroll?" 
              : "Please provide a reason for rejecting this payroll"
            }
          </DialogDescription>
        </DialogHeader>

        {action === "reject" && (
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              data-testid="input-rejection-reason"
            />
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid={`button-cancel-${action}`}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={mutation.isPending}
            variant={action === "approve" ? "default" : "destructive"}
            data-testid={`button-confirm-${action}`}
          >
            {mutation.isPending ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayslipPreviewDialog({
  open,
  onOpenChange,
  payroll,
  employee,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollRecord | null;
  employee: Employee | null;
  items: PayrollItem[];
}) {
  const { toast } = useToast();

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!payroll) return;
      const res = await apiRequest("PUT", `/api/payroll/${payroll.id}/publish`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: "Payslip published to employee portal",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish payslip",
        variant: "destructive",
      });
    },
  });

  if (!payroll || !employee) return null;

  const earnings = items.filter(item => item.type === "earning");
  const deductions = items.filter(item => item.type === "deduction");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-payslip-preview-title">Payslip Preview</DialogTitle>
          <DialogDescription>
            {monthNames[payroll.month - 1]} {payroll.year}
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-6 space-y-6 bg-card">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold">HRMSWorld</h2>
              <p className="text-sm text-muted-foreground">Payslip for {monthNames[payroll.month - 1]} {payroll.year}</p>
            </div>
            <Badge className={getStatusColor(payroll.status)}>
              {payroll.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Employee Details</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name:</dt>
                  <dd className="font-medium">{employee.firstName} {employee.lastName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email:</dt>
                  <dd className="font-medium">{employee.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Employee ID:</dt>
                  <dd className="font-medium">{employee.id.substring(0, 8)}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pay Period</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Working Days:</dt>
                  <dd className="font-medium">{payroll.workingDays}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Present Days:</dt>
                  <dd className="font-medium">{payroll.presentDays}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Absent Days:</dt>
                  <dd className="font-medium text-red-600">{payroll.absentDays}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Earnings</h3>
              <div className="space-y-2">
                {earnings.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t font-semibold">
                  <span>Gross Pay</span>
                  <span>₹{payroll.grossPay.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Deductions</h3>
              <div className="space-y-2">
                {deductions.length > 0 ? (
                  deductions.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-red-600">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No deductions</p>
                )}
                <div className="flex justify-between text-sm pt-2 border-t font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">₹{payroll.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Pay</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{payroll.netPay.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-close-preview"
          >
            Close
          </Button>
          {payroll.status === "approved" && !payroll.payslipPublished && (
            <Button 
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              data-testid="button-publish-payslip"
            >
              <Send className="w-4 h-4 mr-2" />
              {publishMutation.isPending ? "Publishing..." : "Publish to Employee"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PayrollPage() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [approveRejectDialog, setApproveRejectDialog] = useState<{ open: boolean; payroll: PayrollRecord | null; action: "approve" | "reject" }>({
    open: false,
    payroll: null,
    action: "approve",
  });
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; payroll: PayrollRecord | null }>({
    open: false,
    payroll: null,
  });
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  const { toast } = useToast();

  const { data: payrollRecords, isLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: previewItems } = useQuery<PayrollItem[]>({
    queryKey: ["/api/payroll", previewDialog.payroll?.id, "items"],
    enabled: !!previewDialog.payroll,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/payroll/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: "Payroll deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payroll",
        variant: "destructive",
      });
    },
  });

  const filteredPayrolls = useMemo(() => {
    if (!payrollRecords) return [];

    return payrollRecords.filter(payroll => {
      if (filterMonth !== "all" && payroll.month.toString() !== filterMonth) return false;
      if (filterYear !== "all" && payroll.year.toString() !== filterYear) return false;
      if (filterStatus !== "all" && payroll.status !== filterStatus) return false;
      if (filterDepartment !== "all") {
        const employee = employees?.find(e => e.id === payroll.employeeId);
        if (employee?.departmentId !== filterDepartment) return false;
      }
      return true;
    });
  }, [payrollRecords, filterMonth, filterYear, filterStatus, filterDepartment, employees]);

  const stats = useMemo(() => {
    if (!payrollRecords) return { total: 0, totalPayout: 0, pending: 0, approved: 0, rejected: 0 };

    return {
      total: payrollRecords.length,
      totalPayout: payrollRecords.reduce((sum, p) => sum + p.netPay, 0),
      pending: payrollRecords.filter(p => p.status === "pending").length,
      approved: payrollRecords.filter(p => p.status === "approved").length,
      rejected: payrollRecords.filter(p => p.status === "rejected").length,
    };
  }, [payrollRecords]);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  const getEmployee = (employeeId: string) => {
    return employees?.find(e => e.id === employeeId);
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-payroll-title">Payroll Management</h1>
            <p className="text-muted-foreground">Generate and manage employee payroll</p>
          </div>
          <Button 
            onClick={() => setGenerateDialogOpen(true)}
            data-testid="button-generate-payroll"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Payroll
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-employees">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Payroll records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-payout">₹{stats.totalPayout.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Net pay amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-count">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-approved-count">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Ready to publish</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter payroll records by month, year, status, or department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-month">Month</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger data-testid="select-filter-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-year">Year</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger data-testid="select-filter-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {[2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-department">Department</Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger data-testid="select-filter-department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>
              {filteredPayrolls.length} record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No payroll records found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setGenerateDialogOpen(true)}
                  data-testid="button-generate-first"
                >
                  Generate First Payroll
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Working Days</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.map((payroll) => (
                      <TableRow key={payroll.id} data-testid={`row-payroll-${payroll.id}`}>
                        <TableCell className="font-medium">
                          {getEmployeeName(payroll.employeeId)}
                        </TableCell>
                        <TableCell>
                          {monthNames[payroll.month - 1]} {payroll.year}
                        </TableCell>
                        <TableCell>
                          {payroll.presentDays}/{payroll.workingDays}
                        </TableCell>
                        <TableCell>₹{payroll.grossPay.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ₹{payroll.netPay.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payroll.status)}>
                            {payroll.status}
                          </Badge>
                          {payroll.payslipPublished && (
                            <Badge variant="outline" className="ml-2">
                              Published
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewDialog({ open: true, payroll })}
                              data-testid={`button-preview-${payroll.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payroll.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setApproveRejectDialog({ open: true, payroll, action: "approve" })}
                                  data-testid={`button-approve-${payroll.id}`}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setApproveRejectDialog({ open: true, payroll, action: "reject" })}
                                  data-testid={`button-reject-${payroll.id}`}
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {(payroll.status === "pending" || payroll.status === "rejected") && !payroll.payslipPublished && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(payroll.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${payroll.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GeneratePayrollDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />

      <ApproveRejectDialog
        open={approveRejectDialog.open}
        onOpenChange={(open) => setApproveRejectDialog({ ...approveRejectDialog, open })}
        payroll={approveRejectDialog.payroll}
        action={approveRejectDialog.action}
      />

      <PayslipPreviewDialog
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog({ ...previewDialog, open })}
        payroll={previewDialog.payroll}
        employee={previewDialog.payroll ? getEmployee(previewDialog.payroll.employeeId) || null : null}
        items={previewItems || []}
      />
    </DashboardLayout>
  );
}
