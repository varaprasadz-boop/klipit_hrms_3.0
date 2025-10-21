import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  Eye,
  DollarSign,
  Clock,
  Users,
  Filter,
  Download,
  Banknote,
  LayoutDashboard,
  FileText,
  Receipt,
  Settings,
  PieChart,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ExpenseClaim, ExpenseClaimItem, Employee, Department } from "@shared/schema";
import { format } from "date-fns";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Employees", url: "/dashboard/admin/employees", icon: Users },
  { title: "Payroll", url: "/dashboard/admin/payroll", icon: FileText },
  { title: "Expense Dashboard", url: "/dashboard/admin/expense-dashboard", icon: Receipt },
  { title: "Reports", url: "/dashboard/admin/reports", icon: PieChart },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

const statusColors = {
  draft: "bg-gray-500",
  pending_approval: "bg-yellow-500",
  approved: "bg-green-600",
  rejected: "bg-red-600",
  disbursed: "bg-blue-600",
};

const statusLabels = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
};

interface ClaimWithDetails extends ExpenseClaim {
  employee?: Employee;
  items?: ExpenseClaimItem[];
}

export default function ExpenseDashboardPage() {
  const [selectedClaim, setSelectedClaim] = useState<ClaimWithDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDisburseDialogOpen, setIsDisburseDialogOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  const { toast } = useToast();

  const { data: claims, isLoading: claimsLoading } = useQuery<ClaimWithDetails[]>({
    queryKey: ["/api/expense-claims"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const disburseMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const res = await apiRequest("POST", `/api/expense-claims/${claimId}/disburse`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims"] });
      setIsDisburseDialogOpen(false);
      setSelectedClaim(null);
      toast({
        title: "Success",
        description: "Expense claim marked as disbursed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disburse expense claim",
        variant: "destructive",
      });
    },
  });

  const handleViewClaim = (claim: ClaimWithDetails) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  const handleDisburseClaim = (claim: ClaimWithDetails) => {
    setSelectedClaim(claim);
    setIsDisburseDialogOpen(true);
  };

  const confirmDisburse = async () => {
    if (!selectedClaim) return;
    await disburseMutation.mutateAsync(selectedClaim.id);
  };

  const filteredClaims = claims?.filter((claim) => {
    if (statusFilter !== "all" && claim.status !== statusFilter) return false;
    if (employeeFilter !== "all" && claim.employeeId !== employeeFilter) return false;
    if (departmentFilter !== "all" && claim.employee?.departmentId !== departmentFilter) return false;
    if (dateFrom && claim.submittedAt && new Date(claim.submittedAt) < new Date(dateFrom)) return false;
    if (dateTo && claim.submittedAt && new Date(claim.submittedAt) > new Date(dateTo)) return false;
    return true;
  }) || [];

  const pendingClaims = claims?.filter((c) => c.status === "pending_approval") || [];
  const approvedClaims = claims?.filter((c) => c.status === "approved") || [];
  const disbursedClaims = claims?.filter((c) => c.status === "disbursed") || [];

  const totalPending = pendingClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalApproved = approvedClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalDisbursed = disbursedClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setEmployeeFilter("all");
    setDepartmentFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Expense Dashboard</h2>
            <p className="text-muted-foreground">Monitor and manage all expense claims</p>
          </div>
          <Button variant="outline" data-testid="button-export-expenses">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingClaims.length}</div>
              <p className="text-xs text-muted-foreground">₹{totalPending.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedClaims.length}</div>
              <p className="text-xs text-muted-foreground">₹{totalApproved.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
              <Banknote className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{disbursedClaims.length}</div>
              <p className="text-xs text-muted-foreground">₹{totalDisbursed.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" data-testid="select-status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-filter">Employee</Label>
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger id="employee-filter" data-testid="select-employee-filter">
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-filter">Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="department-filter" data-testid="select-department-filter">
                    <SelectValue placeholder="All departments" />
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
              <div className="space-y-2">
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all-claims">
              All Claims ({filteredClaims.length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending-claims">
              Pending ({pendingClaims.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved-claims">
              Approved ({approvedClaims.length})
            </TabsTrigger>
            <TabsTrigger value="disbursed" data-testid="tab-disbursed-claims">
              Disbursed ({disbursedClaims.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ExpenseClaimsTable
              claims={filteredClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
              onDisburse={handleDisburseClaim}
            />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <ExpenseClaimsTable
              claims={pendingClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
            />
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <ExpenseClaimsTable
              claims={approvedClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
              onDisburse={handleDisburseClaim}
            />
          </TabsContent>
          <TabsContent value="disbursed" className="space-y-4">
            <ExpenseClaimsTable
              claims={disbursedClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
            />
          </TabsContent>
        </Tabs>

        {/* View Claim Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="dialog-view-claim">
            <DialogHeader>
              <DialogTitle>Expense Claim Details</DialogTitle>
              <DialogDescription>
                Review the expense claim details and items
              </DialogDescription>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claim Number</p>
                    <p className="text-lg font-semibold">{selectedClaim.claimNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employee</p>
                    <p className="text-lg font-semibold">
                      {selectedClaim.employee
                        ? `${selectedClaim.employee.firstName} ${selectedClaim.employee.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Period</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(selectedClaim.year, selectedClaim.month - 1), "MMMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">₹{selectedClaim.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedClaim.status as keyof typeof statusColors]}>
                      {statusLabels[selectedClaim.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  {selectedClaim.submittedAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(selectedClaim.submittedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}
                </div>

                {selectedClaim.managerRemarks && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Manager Remarks</p>
                    <Card className="p-3 bg-muted">
                      <p className="text-sm">{selectedClaim.managerRemarks}</p>
                    </Card>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Expense Items</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClaim.items && selectedClaim.items.length > 0 ? (
                          selectedClaim.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {format(new Date(item.date), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>{item.expenseTypeId}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {item.description || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No expense items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Disburse Dialog */}
        <Dialog open={isDisburseDialogOpen} onOpenChange={setIsDisburseDialogOpen}>
          <DialogContent data-testid="dialog-disburse-claim">
            <DialogHeader>
              <DialogTitle>Disburse Expense Claim</DialogTitle>
              <DialogDescription>
                Mark this expense claim as disbursed (payment completed)
              </DialogDescription>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Claim Number</p>
                      <p className="font-medium">{selectedClaim.claimNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employee</p>
                      <p className="font-medium">
                        {selectedClaim.employee
                          ? `${selectedClaim.employee.firstName} ${selectedClaim.employee.lastName}`
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">₹{selectedClaim.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to mark this claim as disbursed? This action indicates that
                  the payment has been completed.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDisburseDialogOpen(false)}
                    data-testid="button-cancel-disburse"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDisburse}
                    disabled={disburseMutation.isPending}
                    data-testid="button-confirm-disburse"
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    {disburseMutation.isPending ? "Processing..." : "Mark as Disbursed"}
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

interface ExpenseClaimsTableProps {
  claims: ClaimWithDetails[];
  isLoading: boolean;
  onView: (claim: ClaimWithDetails) => void;
  onDisburse?: (claim: ClaimWithDetails) => void;
}

function ExpenseClaimsTable({
  claims,
  isLoading,
  onView,
  onDisburse,
}: ExpenseClaimsTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Claim Number</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : claims.length > 0 ? (
            claims.map((claim) => (
              <TableRow key={claim.id} data-testid={`row-expense-claim-${claim.id}`}>
                <TableCell className="font-medium" data-testid={`text-employee-${claim.id}`}>
                  {claim.employee
                    ? `${claim.employee.firstName} ${claim.employee.lastName}`
                    : "Unknown"}
                </TableCell>
                <TableCell data-testid={`text-claim-number-${claim.id}`}>
                  {claim.claimNumber}
                </TableCell>
                <TableCell data-testid={`text-claim-period-${claim.id}`}>
                  {format(new Date(claim.year, claim.month - 1), "MMM yyyy")}
                </TableCell>
                <TableCell data-testid={`text-claim-amount-${claim.id}`}>
                  ₹{claim.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell data-testid={`text-claim-status-${claim.id}`}>
                  <Badge className={statusColors[claim.status as keyof typeof statusColors]}>
                    {statusLabels[claim.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-claim-submitted-${claim.id}`}>
                  {claim.submittedAt
                    ? format(new Date(claim.submittedAt), "MMM dd, yyyy")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(claim)}
                      data-testid={`button-view-claim-${claim.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {claim.status === "approved" && onDisburse && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onDisburse(claim)}
                        data-testid={`button-disburse-claim-${claim.id}`}
                      >
                        <Banknote className="h-4 w-4 mr-2" />
                        Disburse
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No expense claims found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
