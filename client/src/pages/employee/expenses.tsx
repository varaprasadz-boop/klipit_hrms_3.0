import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
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
  DialogTrigger,
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Pencil, Trash2, X, Send, Receipt, 
  LayoutDashboard, Clock, Umbrella, Megaphone, 
  FileText, User, CheckCircle2, XCircle, AlertCircle, DollarSign
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ExpenseClaim, ExpenseType, ExpenseClaimItem } from "@shared/schema";
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

const expenseItemSchema = z.object({
  expenseTypeId: z.string().min(1, "Expense type is required"),
  expenseDate: z.string().min(1, "Date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  billNumber: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  distance: z.number().optional(),
});

const newClaimSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  items: z.array(expenseItemSchema).min(1, "Add at least one expense item"),
});

type NewClaimFormData = z.infer<typeof newClaimSchema>;
type ExpenseItemFormData = z.infer<typeof expenseItemSchema>;

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

export default function EmployeeExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<ExpenseClaim | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const { data: claims, isLoading: claimsLoading } = useQuery<ExpenseClaim[]>({
    queryKey: ["/api/expense-claims"],
  });

  const { data: expenseTypes } = useQuery<ExpenseType[]>({
    queryKey: ["/api/expense-types"],
  });

  const createClaimMutation = useMutation({
    mutationFn: async (data: { month: number; year: number }) => {
      const res = await apiRequest("POST", "/api/expense-claims", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims"] });
      toast({
        title: "Success",
        description: "Expense claim created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense claim",
        variant: "destructive",
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ claimId, item }: { claimId: string; item: ExpenseItemFormData }) => {
      const res = await apiRequest("POST", `/api/expense-claims/${claimId}/items`, item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims"] });
      toast({
        title: "Success",
        description: "Expense item added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense item",
        variant: "destructive",
      });
    },
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const res = await apiRequest("POST", `/api/expense-claims/${claimId}/submit`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims"] });
      toast({
        title: "Success",
        description: "Expense claim submitted for approval",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit expense claim",
        variant: "destructive",
      });
    },
  });

  const deleteClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const res = await apiRequest("DELETE", `/api/expense-claims/${claimId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-claims"] });
      toast({
        title: "Success",
        description: "Expense claim deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense claim",
        variant: "destructive",
      });
    },
  });

  const form = useForm<NewClaimFormData>({
    resolver: zodResolver(newClaimSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: NewClaimFormData) => {
    try {
      const claim = await createClaimMutation.mutateAsync({
        month: data.month,
        year: data.year,
      });

      for (const item of data.items) {
        await addItemMutation.mutateAsync({
          claimId: claim.id,
          item,
        });
      }

      setIsDialogOpen(false);
      form.reset({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        items: [],
      });

      toast({
        title: "Success",
        description: "Expense claim created with all items",
      });
    } catch (error) {
      console.error("Error creating claim:", error);
    }
  };

  const handleAddItem = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    append({
      expenseTypeId: "",
      expenseDate: today,
      amount: 0,
      description: "",
      billNumber: "",
      fromLocation: "",
      toLocation: "",
      distance: 0,
    });
  };

  const handleSubmitClaim = async (claimId: string) => {
    await submitClaimMutation.mutateAsync(claimId);
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (confirm("Are you sure you want to delete this expense claim?")) {
      await deleteClaimMutation.mutateAsync(claimId);
    }
  };

  const filteredClaims = claims?.filter(
    (claim) => claim.month === selectedMonth && claim.year === selectedYear
  );

  const draftClaims = claims?.filter((c) => c.status === "draft") || [];
  const pendingClaims = claims?.filter((c) => c.status === "pending_approval") || [];
  const approvedClaims = claims?.filter((c) => c.status === "approved") || [];
  const disbursedClaims = claims?.filter((c) => c.status === "disbursed") || [];

  const totalClaimed = claims?.reduce((sum, c) => sum + (c.totalAmount || 0), 0) || 0;
  const totalApproved = approvedClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalDisbursed = disbursedClaims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">My Expenses</h2>
            <p className="text-muted-foreground">Submit and track your expense claims</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-expense-claim">
                <Plus className="h-4 w-4 mr-2" />
                New Expense Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-expense-claim-form">
              <DialogHeader>
                <DialogTitle>Create New Expense Claim</DialogTitle>
                <DialogDescription>
                  Add your expenses for the selected month and year
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-claim-month">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {format(new Date(2000, i, 1), "MMMM")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-claim-year">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Expense Items</FormLabel>
                        <FormDescription>
                          Add individual expenses to this claim
                        </FormDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddItem}
                        data-testid="button-add-expense-item"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {fields.length === 0 ? (
                      <Card className="p-4 text-center text-sm text-muted-foreground">
                        No expense items added. Click "Add Item" to create one.
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Item {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                  data-testid={`button-remove-item-${index}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.expenseTypeId`}
                                  render={({ field: selectField }) => (
                                    <FormItem>
                                      <FormLabel>Expense Type</FormLabel>
                                      <Select
                                        onValueChange={selectField.onChange}
                                        value={selectField.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger data-testid={`select-expense-type-${index}`}>
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {expenseTypes?.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                              {type.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.expenseDate`}
                                  render={({ field: dateField }) => (
                                    <FormItem>
                                      <FormLabel>Date</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="date"
                                          data-testid={`input-expense-date-${index}`}
                                          {...dateField}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.amount`}
                                  render={({ field: amountField }) => (
                                    <FormItem>
                                      <FormLabel>Amount</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          placeholder="0.00"
                                          data-testid={`input-amount-${index}`}
                                          {...amountField}
                                          onChange={(e) =>
                                            amountField.onChange(parseFloat(e.target.value) || 0)
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.billNumber`}
                                  render={({ field: billField }) => (
                                    <FormItem>
                                      <FormLabel>Bill Number</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Optional"
                                          data-testid={`input-bill-number-${index}`}
                                          {...billField}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.description`}
                                  render={({ field: descField }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Expense description"
                                          data-testid={`input-description-${index}`}
                                          {...descField}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createClaimMutation.isPending || addItemMutation.isPending}
                      data-testid="button-submit-claim"
                    >
                      {createClaimMutation.isPending || addItemMutation.isPending
                        ? "Creating..."
                        : "Create Claim"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalClaimed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{claims?.length || 0} claims</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Claims</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftClaims.length}</div>
              <p className="text-xs text-muted-foreground">Pending submission</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalApproved.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{approvedClaims.length} claims</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalDisbursed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{disbursedClaims.length} claims</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all-claims">All Claims</TabsTrigger>
            <TabsTrigger value="draft" data-testid="tab-draft-claims">Draft ({draftClaims.length})</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending-claims">Pending ({pendingClaims.length})</TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved-claims">Approved ({approvedClaims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ExpenseClaimsTable
              claims={claims || []}
              isLoading={claimsLoading}
              onSubmit={handleSubmitClaim}
              onDelete={handleDeleteClaim}
            />
          </TabsContent>
          <TabsContent value="draft" className="space-y-4">
            <ExpenseClaimsTable
              claims={draftClaims}
              isLoading={claimsLoading}
              onSubmit={handleSubmitClaim}
              onDelete={handleDeleteClaim}
            />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <ExpenseClaimsTable
              claims={pendingClaims}
              isLoading={claimsLoading}
              onSubmit={handleSubmitClaim}
              onDelete={handleDeleteClaim}
            />
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <ExpenseClaimsTable
              claims={approvedClaims}
              isLoading={claimsLoading}
              onSubmit={handleSubmitClaim}
              onDelete={handleDeleteClaim}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface ExpenseClaimsTableProps {
  claims: ExpenseClaim[];
  isLoading: boolean;
  onSubmit: (claimId: string) => void;
  onDelete: (claimId: string) => void;
}

function ExpenseClaimsTable({ claims, isLoading, onSubmit, onDelete }: ExpenseClaimsTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
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
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : claims.length > 0 ? (
            claims.map((claim) => (
              <TableRow key={claim.id} data-testid={`row-expense-claim-${claim.id}`}>
                <TableCell className="font-medium" data-testid={`text-claim-number-${claim.id}`}>
                  {claim.claimNumber}
                </TableCell>
                <TableCell data-testid={`text-claim-period-${claim.id}`}>
                  {format(new Date(claim.year, claim.month - 1), "MMMM yyyy")}
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
                    {claim.status === "draft" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onSubmit(claim.id)}
                          data-testid={`button-submit-claim-${claim.id}`}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(claim.id)}
                          data-testid={`button-delete-claim-${claim.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No expense claims found. Create one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
