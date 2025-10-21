import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  insertExpenseTypeSchema, 
  type ExpenseType, 
  type InsertExpenseType,
  type RoleLevel 
} from "@shared/schema";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, CalendarCheck, UserCheck,
  Target, MapPin, Timer, LayoutGrid, Building2, Briefcase, Star, DollarSign
} from "lucide-react";

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

const formSchema = insertExpenseTypeSchema.extend({
  code: insertExpenseTypeSchema.shape.code.min(1, "Code is required"),
  name: insertExpenseTypeSchema.shape.name.min(1, "Name is required"),
});

type FormData = InsertExpenseType;

export default function ExpenseTypesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpenseType, setEditingExpenseType] = useState<ExpenseType | null>(null);
  const [deletingExpenseType, setDeletingExpenseType] = useState<ExpenseType | null>(null);
  const { toast } = useToast();

  const { data: expenseTypes, isLoading } = useQuery<ExpenseType[]>({
    queryKey: ["/api/expense-types"],
  });

  const { data: roleLevels } = useQuery<RoleLevel[]>({
    queryKey: ["/api/roles-levels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/expense-types", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-types"] });
      toast({
        title: "Success",
        description: "Expense type created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await apiRequest("PUT", `/api/expense-types/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-types"] });
      toast({
        title: "Success",
        description: "Expense type updated successfully",
      });
      setIsDialogOpen(false);
      setEditingExpenseType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/expense-types/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-types"] });
      toast({
        title: "Success",
        description: "Expense type deleted successfully",
      });
      setDeletingExpenseType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense type",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      roleLevelLimits: [],
      enableGoogleMaps: false,
      billMandatory: false,
      approvalRequired: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "roleLevelLimits",
  });

  const onSubmit = (data: FormData) => {
    if (editingExpenseType) {
      updateMutation.mutate({ id: editingExpenseType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (expenseType: ExpenseType) => {
    setEditingExpenseType(expenseType);
    form.reset({
      code: expenseType.code,
      name: expenseType.name,
      roleLevelLimits: expenseType.roleLevelLimits || [],
      enableGoogleMaps: expenseType.enableGoogleMaps || false,
      billMandatory: expenseType.billMandatory || false,
      approvalRequired: expenseType.approvalRequired ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (expenseType: ExpenseType) => {
    setDeletingExpenseType(expenseType);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpenseType(null);
    form.reset({
      code: "",
      name: "",
      roleLevelLimits: [],
      enableGoogleMaps: false,
      billMandatory: false,
      approvalRequired: true,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingExpenseType(null);
      form.reset({
        code: "",
        name: "",
        roleLevelLimits: [],
        enableGoogleMaps: false,
        billMandatory: false,
        approvalRequired: true,
      });
    }
  };

  const addRoleLevelLimit = () => {
    if (roleLevels && roleLevels.length > 0) {
      const firstRole = roleLevels[0];
      append({
        roleLevelId: firstRole.id,
        roleName: `${firstRole.role} - ${firstRole.level}`,
        limitAmount: 0,
        limitUnit: "fixed",
      });
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Expense Types</h2>
            <p className="text-muted-foreground">Manage different types of expenses with role-based limits</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-expense-type">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-expense-type-form">
              <DialogHeader>
                <DialogTitle>
                  {editingExpenseType ? "Edit Expense Type" : "Add Expense Type"}
                </DialogTitle>
                <DialogDescription>
                  {editingExpenseType
                    ? "Update the expense type details below."
                    : "Create a new expense type for your organization."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-expense-type-code"
                            placeholder="e.g., TRVL, MEAL, FUEL"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-expense-type-name"
                            placeholder="e.g., Travel, Meals, Fuel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="enableGoogleMaps"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              data-testid="checkbox-expense-type-enableGoogleMaps"
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal cursor-pointer">
                              Enable Google Maps Distance Calculator
                            </FormLabel>
                            <FormDescription>
                              Allow employees to calculate travel distance using Google Maps
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billMandatory"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              data-testid="checkbox-expense-type-billMandatory"
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal cursor-pointer">
                              Bill/Receipt Mandatory
                            </FormLabel>
                            <FormDescription>
                              Require bill/receipt attachment for this expense type
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="approvalRequired"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              data-testid="checkbox-expense-type-approvalRequired"
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal cursor-pointer">
                              Approval Required
                            </FormLabel>
                            <FormDescription>
                              Require manager approval for this expense type
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Role-Level Limits</FormLabel>
                        <FormDescription>
                          Set spending limits for different role levels
                        </FormDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRoleLevelLimit}
                        disabled={!roleLevels || roleLevels.length === 0}
                        data-testid="button-add-role-limit"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Limit
                      </Button>
                    </div>

                    {fields.length === 0 ? (
                      <Card className="p-4 text-center text-sm text-muted-foreground">
                        No role-level limits configured. Click "Add Limit" to create one.
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Limit {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                  data-testid={`button-remove-role-limit-${index}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`roleLevelLimits.${index}.roleLevelId`}
                                  render={({ field: selectField }) => (
                                    <FormItem>
                                      <FormLabel>Role Level</FormLabel>
                                      <Select
                                        onValueChange={(value) => {
                                          selectField.onChange(value);
                                          const role = roleLevels?.find(r => r.id === value);
                                          if (role) {
                                            form.setValue(`roleLevelLimits.${index}.roleName`, `${role.role} - ${role.level}`);
                                          }
                                        }}
                                        value={selectField.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger data-testid={`select-role-level-${index}`}>
                                            <SelectValue placeholder="Select role" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {roleLevels?.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                              {role.role} - {role.level}
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
                                  name={`roleLevelLimits.${index}.limitUnit`}
                                  render={({ field: selectField }) => (
                                    <FormItem>
                                      <FormLabel>Limit Unit</FormLabel>
                                      <Select
                                        onValueChange={selectField.onChange}
                                        value={selectField.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger data-testid={`select-limit-unit-${index}`}>
                                            <SelectValue placeholder="Select unit" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                                          <SelectItem value="per_km">Per Kilometer</SelectItem>
                                          <SelectItem value="per_day">Per Day</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`roleLevelLimits.${index}.limitAmount`}
                                  render={({ field: amountField }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Limit Amount</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          placeholder="Enter amount"
                                          data-testid={`input-limit-amount-${index}`}
                                          {...amountField}
                                          onChange={(e) => amountField.onChange(parseFloat(e.target.value) || 0)}
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
                      onClick={handleCloseDialog}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-expense-type"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingExpenseType
                        ? "Update"
                        : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role Limits</TableHead>
                <TableHead>Google Maps</TableHead>
                <TableHead>Bill Required</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : expenseTypes && expenseTypes.length > 0 ? (
                expenseTypes.map((expenseType) => (
                  <TableRow key={expenseType.id} data-testid={`row-expense-type-${expenseType.id}`}>
                    <TableCell className="font-medium" data-testid={`text-expense-type-code-${expenseType.id}`}>
                      <Badge variant="outline">{expenseType.code}</Badge>
                    </TableCell>
                    <TableCell data-testid={`text-expense-type-name-${expenseType.id}`}>
                      {expenseType.name}
                    </TableCell>
                    <TableCell data-testid={`text-expense-type-limits-${expenseType.id}`}>
                      <Badge variant="secondary">
                        {expenseType.roleLevelLimits?.length || 0} limit(s)
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-expense-type-googleMaps-${expenseType.id}`}>
                      {expenseType.enableGoogleMaps ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-expense-type-billMandatory-${expenseType.id}`}>
                      {expenseType.billMandatory ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-expense-type-approval-${expenseType.id}`}>
                      {expenseType.approvalRequired ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(expenseType)}
                          data-testid={`button-edit-expense-type-${expenseType.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(expenseType)}
                          data-testid={`button-delete-expense-type-${expenseType.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No expense types found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deletingExpenseType} onOpenChange={() => setDeletingExpenseType(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense type "{deletingExpenseType?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingExpenseType && deleteMutation.mutate(deletingExpenseType.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
