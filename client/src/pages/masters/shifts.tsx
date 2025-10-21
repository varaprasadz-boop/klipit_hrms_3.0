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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 , DollarSign} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertShiftSchema, type Shift, type InsertShift } from "@shared/schema";
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

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formSchema = insertShiftSchema.extend({
  name: insertShiftSchema.shape.name.min(1, "Name is required"),
  startTime: insertShiftSchema.shape.startTime.regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  endTime: insertShiftSchema.shape.endTime.regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
});

type FormData = {
  name: string;
  startTime: string;
  endTime: string;
  weeklyOffs?: string[];
};

export default function ShiftsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deletingShift, setDeletingShift] = useState<Shift | null>(null);
  const { toast } = useToast();

  const { data: shifts, isLoading } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/shifts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shift",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await apiRequest("PUT", `/api/shifts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Success",
        description: "Shift updated successfully",
      });
      setIsDialogOpen(false);
      setEditingShift(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shift",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/shifts/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });
      setDeletingShift(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shift",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
      weeklyOffs: [],
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingShift) {
      updateMutation.mutate({ id: editingShift.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    form.reset({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      weeklyOffs: shift.weeklyOffs || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (shift: Shift) => {
    setDeletingShift(shift);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingShift(null);
    form.reset({ name: "", startTime: "", endTime: "", weeklyOffs: [] });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingShift(null);
      form.reset({ name: "", startTime: "", endTime: "", weeklyOffs: [] });
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Shifts</h2>
            <p className="text-muted-foreground">Manage work shifts and schedules</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-shift">
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-shift-form">
              <DialogHeader>
                <DialogTitle>
                  {editingShift ? "Edit Shift" : "Add Shift"}
                </DialogTitle>
                <DialogDescription>
                  {editingShift
                    ? "Update the shift details below."
                    : "Create a new shift for your organization."}
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
                            data-testid="input-shift-name"
                            placeholder="e.g., Morning Shift, Night Shift"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time (HH:MM)</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-shift-startTime"
                            placeholder="09:00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time (HH:MM)</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-shift-endTime"
                            placeholder="18:00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weeklyOffs"
                    render={() => (
                      <FormItem>
                        <FormLabel>Weekly Offs</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {weekDays.map((day) => (
                            <FormField
                              key={day}
                              control={form.control}
                              name="weeklyOffs"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      data-testid={`checkbox-weeklyOff-${day}`}
                                      checked={field.value?.includes(day)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        const updated = checked
                                          ? [...current, day]
                                          : current.filter((d) => d !== day);
                                        field.onChange(updated);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {day}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
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
                      data-testid="button-submit-shift"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingShift
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
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Weekly Offs</TableHead>
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
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : shifts && shifts.length > 0 ? (
                shifts.map((shift) => (
                  <TableRow key={shift.id} data-testid={`row-shift-${shift.id}`}>
                    <TableCell className="font-medium" data-testid={`text-shift-name-${shift.id}`}>
                      {shift.name}
                    </TableCell>
                    <TableCell data-testid={`text-shift-startTime-${shift.id}`}>
                      {shift.startTime}
                    </TableCell>
                    <TableCell data-testid={`text-shift-endTime-${shift.id}`}>
                      {shift.endTime}
                    </TableCell>
                    <TableCell data-testid={`text-shift-weeklyOffs-${shift.id}`}>
                      {shift.weeklyOffs && shift.weeklyOffs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {shift.weeklyOffs.map((day) => (
                            <Badge key={day} variant="secondary">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(shift)}
                          data-testid={`button-edit-shift-${shift.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(shift)}
                          data-testid={`button-delete-shift-${shift.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No shifts found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deletingShift} onOpenChange={() => setDeletingShift(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the shift "{deletingShift?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingShift && deleteMutation.mutate(deletingShift.id)}
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
