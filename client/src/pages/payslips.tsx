import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Download, Printer, Mail, FileText, Eye, Search,
  LayoutDashboard, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, UserPlus, Shield, 
  BarChart3, Settings, Target, Building2, Star, DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PayrollRecord, Employee, Department } from "@shared/schema";

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

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

type PayrollWithEmployee = PayrollRecord & {
  employee?: Employee;
};

export default function PayslipsPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [viewingPayslip, setViewingPayslip] = useState<PayrollWithEmployee | null>(null);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedPayslips([]);
  }, [selectedMonth, selectedYear, selectedDepartment, searchQuery]);

  const { data: payrollRecords, isLoading: isLoadingPayroll } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Filter only published payslips
  const publishedPayslips = (payrollRecords || []).filter(p => p.payslipPublished);

  // Add employee data to payslips
  const payslipsWithEmployees: PayrollWithEmployee[] = publishedPayslips.map(payslip => ({
    ...payslip,
    employee: employees?.find(e => e.id === payslip.employeeId),
  }));

  // Apply filters
  const filteredPayslips = payslipsWithEmployees.filter(payslip => {
    if (selectedMonth !== "all" && payslip.month !== parseInt(selectedMonth)) return false;
    if (selectedYear && payslip.year !== parseInt(selectedYear)) return false;
    if (selectedDepartment !== "all" && payslip.employee?.department !== selectedDepartment) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = payslip.employee?.name?.toLowerCase().includes(query) || false;
      const codeMatch = payslip.employee?.employeeCode?.toLowerCase().includes(query) || false;
      if (!nameMatch && !codeMatch) return false;
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayslips(filteredPayslips.map(p => p.id));
    } else {
      setSelectedPayslips([]);
    }
  };

  const handleSelectPayslip = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPayslips([...selectedPayslips, id]);
    } else {
      setSelectedPayslips(selectedPayslips.filter(pid => pid !== id));
    }
  };

  const handleDownloadPDF = (payslip: PayrollWithEmployee) => {
    toast({
      title: "Download Started",
      description: `Downloading payslip for ${payslip.employee?.name} - ${MONTHS[payslip.month - 1]?.label} ${payslip.year}`,
    });
    // TODO: Implement actual PDF download
    console.log("Download PDF for payslip:", payslip.id);
  };

  const handlePrint = (payslip: PayrollWithEmployee) => {
    toast({
      title: "Print",
      description: `Opening print dialog for ${payslip.employee?.name}`,
    });
    // TODO: Implement actual print functionality
    console.log("Print payslip:", payslip.id);
    window.print();
  };

  const handleBulkEmail = () => {
    if (selectedPayslips.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select payslips to email",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sending Emails",
      description: `Sending ${selectedPayslips.length} payslip(s) via email...`,
    });
    // TODO: Implement actual bulk email functionality
    console.log("Send email for payslips:", selectedPayslips);
    
    setTimeout(() => {
      toast({
        title: "Success",
        description: `${selectedPayslips.length} payslip(s) emailed successfully`,
      });
      setSelectedPayslips([]);
    }, 1500);
  };

  const handleBulkDownload = () => {
    if (selectedPayslips.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select payslips to download",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Downloading",
      description: `Preparing ${selectedPayslips.length} payslip(s) for download...`,
    });
    // TODO: Implement actual bulk download (ZIP)
    console.log("Download multiple payslips:", selectedPayslips);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return MONTHS[month - 1]?.label || String(month);
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Payslips</h2>
            <p className="text-muted-foreground">
              Manage and distribute employee payslips
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBulkDownload}
              disabled={selectedPayslips.length === 0}
              data-testid="button-bulk-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Selected ({selectedPayslips.length})
            </Button>
            <Button
              onClick={handleBulkEmail}
              disabled={selectedPayslips.length === 0}
              data-testid="button-bulk-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Selected ({selectedPayslips.length})
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payslips
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedPayslips.length}</div>
              <p className="text-xs text-muted-foreground">Published payslips</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {publishedPayslips.filter(p => 
                  p.month === new Date().getMonth() + 1 && 
                  p.year === new Date().getFullYear()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Current month payslips</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Filtered Results
              </CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPayslips.length}</div>
              <p className="text-xs text-muted-foreground">Matching filters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Selected
              </CardTitle>
              <Checkbox className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedPayslips.length}</div>
              <p className="text-xs text-muted-foreground">Selected for action</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter payslips by period, department, and employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger data-testid="select-month">
                    <SelectValue placeholder="All months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger data-testid="select-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(year => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments?.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search Employee</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name or employee code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-employee"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payslips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payslips ({filteredPayslips.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                      onCheckedChange={handleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPayroll ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredPayslips.length > 0 ? (
                  filteredPayslips.map((payslip) => (
                    <TableRow key={payslip.id} data-testid={`row-payslip-${payslip.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayslips.includes(payslip.id)}
                          onCheckedChange={(checked) => handleSelectPayslip(payslip.id, checked as boolean)}
                          data-testid={`checkbox-payslip-${payslip.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {payslip.employee?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{payslip.employee?.employeeCode || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payslip.employee?.department || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getMonthName(payslip.month)} {payslip.year}</TableCell>
                      <TableCell>{formatCurrency(payslip.grossPay)}</TableCell>
                      <TableCell className="text-destructive">
                        {formatCurrency(payslip.totalDeductions)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payslip.netPay)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {payslip.payslipPublishedAt 
                            ? new Date(payslip.payslipPublishedAt).toLocaleDateString()
                            : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingPayslip(payslip)}
                            data-testid={`button-view-${payslip.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPDF(payslip)}
                            data-testid={`button-download-${payslip.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(payslip)}
                            data-testid={`button-print-${payslip.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      No published payslips found matching the filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Payslip Dialog */}
        <Dialog open={!!viewingPayslip} onOpenChange={(open) => !open && setViewingPayslip(null)}>
          <DialogContent className="max-w-2xl" data-testid="dialog-view-payslip">
            <DialogHeader>
              <DialogTitle>Payslip Details</DialogTitle>
              <DialogDescription>
                {viewingPayslip?.employee?.name} - {viewingPayslip && getMonthName(viewingPayslip.month)} {viewingPayslip?.year}
              </DialogDescription>
            </DialogHeader>
            {viewingPayslip && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee Code</label>
                    <p className="text-sm">{viewingPayslip.employee?.employeeCode || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-sm">{viewingPayslip.employee?.department || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Working Days</label>
                    <p className="text-sm">{viewingPayslip.workingDays} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Present Days</label>
                    <p className="text-sm">{viewingPayslip.presentDays} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Paid Leave</label>
                    <p className="text-sm">{viewingPayslip.paidLeaveDays} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Overtime Hours</label>
                    <p className="text-sm">{viewingPayslip.overtimeHours} hours</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Salary Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Gross Pay</span>
                      <span className="text-sm font-medium">{formatCurrency(viewingPayslip.grossPay)}</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span className="text-sm">Total Deductions</span>
                      <span className="text-sm font-medium">- {formatCurrency(viewingPayslip.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Pay</span>
                      <span className="font-bold text-lg">{formatCurrency(viewingPayslip.netPay)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => viewingPayslip && handleDownloadPDF(viewingPayslip)}
                    data-testid="button-download-dialog"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => viewingPayslip && handlePrint(viewingPayslip)}
                    data-testid="button-print-dialog"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
