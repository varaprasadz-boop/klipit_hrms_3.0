import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, LayoutDashboard, Target, Building2, Clock, Umbrella, Workflow, Receipt, Star, Megaphone, FileText, UserPlus, Shield, BarChart3, Settings, DollarSign } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCtcComponentSchema, type CtcComponent } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/DashboardLayout";

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

type FormData = z.infer<typeof insertCtcComponentSchema>;

export default function CtcComponentsPage() {
  const [activeTab, setActiveTab] = useState<"payable" | "deductable">("payable");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<CtcComponent | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<CtcComponent | null>(null);
  const { toast } = useToast();

  const { data: allComponents, isLoading } = useQuery<CtcComponent[]>({
    queryKey: ["/api/ctc-components"],
  });

  const payables = allComponents?.filter((c) => c.type === "payable") || [];
  const deductables = allComponents?.filter((c) => c.type === "deductable") || [];

  const form = useForm<FormData>({
    resolver: zodResolver(insertCtcComponentSchema),
    defaultValues: {
      name: "",
      type: "payable",
      isStandard: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/ctc-components", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ctc-components"] });
      toast({ title: "Success", description: "CTC component created successfully" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CtcComponent> }) =>
      apiRequest("PUT", `/api/ctc-components/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ctc-components"] });
      toast({ title: "Success", description: "CTC component updated successfully" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/ctc-components/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ctc-components"] });
      toast({ title: "Success", description: "CTC component deleted successfully" });
      setDeletingComponent(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingComponent) {
      updateMutation.mutate({ id: editingComponent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (component: CtcComponent) => {
    setEditingComponent(component);
    form.reset({
      name: component.name,
      type: component.type,
      isStandard: component.isStandard || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (component: CtcComponent) => {
    setDeletingComponent(component);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingComponent(null);
    form.reset({ name: "", type: activeTab, isStandard: false });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingComponent(null);
      form.reset({ name: "", type: activeTab, isStandard: false });
    }
  };

  const handleAddNew = (type: "payable" | "deductable") => {
    form.reset({ name: "", type, isStandard: false });
    setIsDialogOpen(true);
  };

  const renderTable = (components: CtcComponent[], type: "payable" | "deductable") => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : components && components.length > 0 ? (
            components.map((component) => (
              <TableRow key={component.id} data-testid={`row-ctc-component-${component.id}`}>
                <TableCell className="font-medium" data-testid={`text-component-name-${component.id}`}>
                  {component.name}
                </TableCell>
                <TableCell className="capitalize">{component.type}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(component)}
                      data-testid={`button-edit-component-${component.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(component)}
                      data-testid={`button-delete-component-${component.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No {type}s found. Click "Add {type === "payable" ? "Payable" : "Deductable"}" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">CTC Components</h2>
          <p className="text-muted-foreground">Manage salary components for payables and deductables</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "payable" | "deductable")}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="payable" data-testid="tab-payables">Payables</TabsTrigger>
              <TabsTrigger value="deductable" data-testid="tab-deductables">Deductables</TabsTrigger>
            </TabsList>
            <Button onClick={() => handleAddNew(activeTab)} data-testid={`button-add-${activeTab}`}>
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === "payable" ? "Payable" : "Deductable"}
            </Button>
          </div>

          <TabsContent value="payable" className="mt-0">
            {renderTable(payables, "payable")}
          </TabsContent>

          <TabsContent value="deductable" className="mt-0">
            {renderTable(deductables, "deductable")}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent data-testid="dialog-ctc-component-form">
            <DialogHeader>
              <DialogTitle>
                {editingComponent ? "Edit CTC Component" : `Add ${activeTab === "payable" ? "Payable" : "Deductable"}`}
              </DialogTitle>
              <DialogDescription>
                {editingComponent
                  ? "Update the component details below."
                  : `Create a new ${activeTab} component.`}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Component Name</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-component-name"
                          placeholder={
                            activeTab === "payable"
                              ? "e.g., Basic Salary, HRA, Conveyance"
                              : "e.g., TDS, PT, PF Contribution"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <input type="hidden" {...form.register("type")} value={editingComponent?.type || activeTab} />
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
                    data-testid="button-submit-component"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingComponent
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingComponent} onOpenChange={() => setDeletingComponent(null)}>
          <AlertDialogContent data-testid="dialog-delete-confirmation">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the CTC component "{deletingComponent?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingComponent && deleteMutation.mutate(deletingComponent.id)}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
