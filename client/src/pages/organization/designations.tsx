import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 , DollarSign} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertDesignationSchema, type Designation, type InsertDesignation } from "@shared/schema";
import { 
  LayoutDashboard, Users, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, CalendarCheck, UserCheck,
  Target, MapPin, Timer, LayoutGrid, Building2, Briefcase, Star
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

const formSchema = insertDesignationSchema.extend({
  name: insertDesignationSchema.shape.name.min(1, "Name is required"),
  description: insertDesignationSchema.shape.description.optional(),
});

type FormData = {
  name: string;
  description?: string;
};

export default function DesignationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [deletingDesignation, setDeletingDesignation] = useState<Designation | null>(null);
  const { toast } = useToast();

  const { data: designations, isLoading } = useQuery<Designation[]>({
    queryKey: ["/api/designations"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/designations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      toast({
        title: "Success",
        description: "Designation created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create designation",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await apiRequest("PUT", `/api/designations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      toast({
        title: "Success",
        description: "Designation updated successfully",
      });
      setIsDialogOpen(false);
      setEditingDesignation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update designation",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/designations/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      toast({
        title: "Success",
        description: "Designation deleted successfully",
      });
      setDeletingDesignation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete designation",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingDesignation) {
      updateMutation.mutate({ id: editingDesignation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    form.reset({
      name: designation.name,
      description: designation.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (designation: Designation) => {
    setDeletingDesignation(designation);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDesignation(null);
    form.reset({ name: "", description: "" });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingDesignation(null);
      form.reset({ name: "", description: "" });
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Designations</h2>
            <p className="text-muted-foreground">Manage job titles and designations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-designation">
                <Plus className="h-4 w-4 mr-2" />
                Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-designation-form">
              <DialogHeader>
                <DialogTitle>
                  {editingDesignation ? "Edit Designation" : "Add Designation"}
                </DialogTitle>
                <DialogDescription>
                  {editingDesignation
                    ? "Update the designation details below."
                    : "Create a new designation for your organization."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-designation-name"
                            placeholder="e.g., Senior Engineer, Manager, Associate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            data-testid="input-designation-description"
                            placeholder="Brief description of the designation"
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
                      onClick={handleCloseDialog}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-designation"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingDesignation
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
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
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : designations && designations.length > 0 ? (
                designations.map((designation) => (
                  <TableRow key={designation.id} data-testid={`row-designation-${designation.id}`}>
                    <TableCell className="font-medium" data-testid={`text-designation-name-${designation.id}`}>
                      {designation.name}
                    </TableCell>
                    <TableCell data-testid={`text-designation-description-${designation.id}`}>
                      {designation.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(designation)}
                          data-testid={`button-edit-designation-${designation.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(designation)}
                          data-testid={`button-delete-designation-${designation.id}`}
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
                    No designations found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deletingDesignation} onOpenChange={() => setDeletingDesignation(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the designation "{deletingDesignation?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDesignation && deleteMutation.mutate(deletingDesignation.id)}
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
