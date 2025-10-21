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
import { insertHolidaySchema, type Holiday, type InsertHoliday } from "@shared/schema";
import { format } from "date-fns";
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

const formSchema = insertHolidaySchema.extend({
  name: insertHolidaySchema.shape.name.min(1, "Name is required"),
  date: insertHolidaySchema.shape.date,
});

type FormData = {
  date: string;
  name: string;
  description?: string;
};

export default function HolidaysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const { toast } = useToast();

  const { data: holidays, isLoading } = useQuery<Holiday[]>({
    queryKey: ["/api/holidays"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/holidays", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: "Holiday created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create holiday",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await apiRequest("PUT", `/api/holidays/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: "Holiday updated successfully",
      });
      setIsDialogOpen(false);
      setEditingHoliday(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update holiday",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/holidays/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: "Holiday deleted successfully",
      });
      setDeletingHoliday(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete holiday",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    form.reset({
      date: holiday.date,
      name: holiday.name,
      description: holiday.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setDeletingHoliday(holiday);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHoliday(null);
    form.reset({ date: "", name: "", description: "" });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingHoliday(null);
      form.reset({ date: "", name: "", description: "" });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Holidays</h2>
            <p className="text-muted-foreground">Manage company holidays and observances</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-holiday">
                <Plus className="h-4 w-4 mr-2" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-holiday-form">
              <DialogHeader>
                <DialogTitle>
                  {editingHoliday ? "Edit Holiday" : "Add Holiday"}
                </DialogTitle>
                <DialogDescription>
                  {editingHoliday
                    ? "Update the holiday details below."
                    : "Create a new holiday for your organization."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            data-testid="input-holiday-date"
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
                            data-testid="input-holiday-name"
                            placeholder="e.g., New Year's Day, Independence Day"
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
                            data-testid="input-holiday-description"
                            placeholder="Additional details about this holiday"
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
                      data-testid="button-submit-holiday"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingHoliday
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
                <TableHead>Date</TableHead>
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
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : holidays && holidays.length > 0 ? (
                holidays.map((holiday) => (
                  <TableRow key={holiday.id} data-testid={`row-holiday-${holiday.id}`}>
                    <TableCell className="font-medium" data-testid={`text-holiday-date-${holiday.id}`}>
                      {formatDate(holiday.date)}
                    </TableCell>
                    <TableCell data-testid={`text-holiday-name-${holiday.id}`}>
                      {holiday.name}
                    </TableCell>
                    <TableCell data-testid={`text-holiday-description-${holiday.id}`}>
                      {holiday.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(holiday)}
                          data-testid={`button-edit-holiday-${holiday.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(holiday)}
                          data-testid={`button-delete-holiday-${holiday.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No holidays found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deletingHoliday} onOpenChange={() => setDeletingHoliday(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the holiday "{deletingHoliday?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingHoliday && deleteMutation.mutate(deletingHoliday.id)}
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
