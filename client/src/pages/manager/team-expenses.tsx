import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  LayoutDashboard,
  Receipt,
  Umbrella,
  Megaphone,
  FileText,
  User,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ExpenseClaim, ExpenseClaimItem, Employee } from "@shared/schema";
import { format } from "date-fns";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Team Expenses", url: "/dashboard/manager/team-expenses", icon: Receipt },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "My Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

const approvalSchema = z.object({
  managerRemarks: z.string().optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

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

export default function TeamExpensesPage() {
  const [selectedClaim, setSelectedClaim] = useState<ClaimWithDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: teamClaims, isLoading: claimsLoading } = useQuery<ClaimWithDetails[]>({
    queryKey: ["/api/expense-claims/team"],
  });

  const approveForm = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      managerRemarks: "",
    },
  });

  const rejectForm = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      managerRemarks: "",
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ claimId, remarks }: { claimId: string; remarks?: string }) => {
      const res = await apiRequest("POST", `/api/expense-claims/${claimId}/approve`, {
        managerRemarks: remarks,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims/team"] });
      setIsApproveDialogOpen(false);
      setSelectedClaim(null);
      approveForm.reset();
      toast({
        title: "Success",
        description: "Expense claim approved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve expense claim",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ claimId, remarks }: { claimId: string; remarks?: string }) => {
      const res = await apiRequest("POST", `/api/expense-claims/${claimId}/reject`, {
        managerRemarks: remarks,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims/team"] });
      setIsRejectDialogOpen(false);
      setSelectedClaim(null);
      rejectForm.reset();
      toast({
        title: "Success",
        description: "Expense claim rejected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject expense claim",
        variant: "destructive",
      });
    },
  });

  const handleViewClaim = (claim: ClaimWithDetails) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  const handleApproveClaim = (claim: ClaimWithDetails) => {
    setSelectedClaim(claim);
    setIsApproveDialogOpen(true);
  };

  const handleRejectClaim = (claim: ClaimWithDetails) => {
    setSelectedClaim(claim);
    setIsRejectDialogOpen(true);
  };

  const onApproveSubmit = async (data: ApprovalFormData) => {
    if (!selectedClaim) return;
    await approveMutation.mutateAsync({
      claimId: selectedClaim.id,
      remarks: data.managerRemarks,
    });
  };

  const onRejectSubmit = async (data: ApprovalFormData) => {
    if (!selectedClaim) return;
    await rejectMutation.mutateAsync({
      claimId: selectedClaim.id,
      remarks: data.managerRemarks,
    });
  };

  const pendingClaims = teamClaims?.filter((c) => c.status === "pending_approval") || [];
  const approvedClaims = teamClaims?.filter((c) => c.status === "approved") || [];
  const rejectedClaims = teamClaims?.filter((c) => c.status === "rejected") || [];

  const totalPending = pendingClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalApproved = approvedClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Team Expense Claims</h2>
            <p className="text-muted-foreground">Review and approve expense claims from your team</p>
          </div>
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
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedClaims.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(teamClaims?.map((c) => c.employeeId)).size}
              </div>
              <p className="text-xs text-muted-foreground">Reporting to you</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending-claims">
              Pending ({pendingClaims.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved-claims">
              Approved ({approvedClaims.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected-claims">
              Rejected ({rejectedClaims.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all-claims">
              All Claims
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <TeamExpenseTable
              claims={pendingClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
              onApprove={handleApproveClaim}
              onReject={handleRejectClaim}
            />
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <TeamExpenseTable
              claims={approvedClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
            />
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            <TeamExpenseTable
              claims={rejectedClaims}
              isLoading={claimsLoading}
              onView={handleViewClaim}
            />
          </TabsContent>
          <TabsContent value="all" className="space-y-4">
            <TeamExpenseTable
              claims={teamClaims || []}
              isLoading={claimsLoading}
              onView={handleViewClaim}
              onApprove={handleApproveClaim}
              onReject={handleRejectClaim}
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

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent data-testid="dialog-approve-claim">
            <DialogHeader>
              <DialogTitle>Approve Expense Claim</DialogTitle>
              <DialogDescription>
                Approve this expense claim and add optional remarks
              </DialogDescription>
            </DialogHeader>
            <Form {...approveForm}>
              <form onSubmit={approveForm.handleSubmit(onApproveSubmit)} className="space-y-4">
                {selectedClaim && (
                  <div className="rounded-lg border p-4 bg-muted">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Claim Number</p>
                        <p className="font-medium">{selectedClaim.claimNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{selectedClaim.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                <FormField
                  control={approveForm.control}
                  name="managerRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add your remarks here..."
                          data-testid="input-approve-remarks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApproveDialogOpen(false)}
                    data-testid="button-cancel-approve"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={approveMutation.isPending}
                    data-testid="button-confirm-approve"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent data-testid="dialog-reject-claim">
            <DialogHeader>
              <DialogTitle>Reject Expense Claim</DialogTitle>
              <DialogDescription>
                Reject this expense claim and add optional remarks
              </DialogDescription>
            </DialogHeader>
            <Form {...rejectForm}>
              <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)} className="space-y-4">
                {selectedClaim && (
                  <div className="rounded-lg border p-4 bg-muted">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Claim Number</p>
                        <p className="font-medium">{selectedClaim.claimNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{selectedClaim.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                <FormField
                  control={rejectForm.control}
                  name="managerRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add your remarks here..."
                          data-testid="input-reject-remarks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRejectDialogOpen(false)}
                    data-testid="button-cancel-reject"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                    data-testid="button-confirm-reject"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

interface TeamExpenseTableProps {
  claims: ClaimWithDetails[];
  isLoading: boolean;
  onView: (claim: ClaimWithDetails) => void;
  onApprove?: (claim: ClaimWithDetails) => void;
  onReject?: (claim: ClaimWithDetails) => void;
}

function TeamExpenseTable({
  claims,
  isLoading,
  onView,
  onApprove,
  onReject,
}: TeamExpenseTableProps) {
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
              <TableRow key={claim.id} data-testid={`row-team-claim-${claim.id}`}>
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
                    {claim.status === "pending_approval" && onApprove && onReject && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onApprove(claim)}
                          data-testid={`button-approve-claim-${claim.id}`}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onReject(claim)}
                          data-testid={`button-reject-claim-${claim.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
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
