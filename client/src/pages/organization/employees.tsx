import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee, Department, Designation, RoleLevel, InsertEmployee } from "@shared/schema";
import { insertEmployeeSchema } from "@shared/schema";
import { 
  Users, UserPlus, UserCheck, UserX, User, Plus, Pencil, Trash2, 
  Building2, Briefcase, Star, CalendarIcon, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus as UserPlusIcon, Shield, 
  BarChart3, Settings, Target, Building2 as Building2Icon, Star as StarIcon, DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    icon: Building2Icon,
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
    icon: StarIcon,
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
  { title: "Lifecycle", url: "/dashboard/admin/lifecycle", icon: UserPlusIcon },
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

function EmployeeDialog({ 
  open, 
  onOpenChange, 
  employee, 
  departments, 
  designations, 
  rolesLevels 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  employee?: Employee | null;
  departments: Department[];
  designations: Designation[];
  rolesLevels: RoleLevel[];
}) {
  const { toast } = useToast();
  const isEdit = !!employee;

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: employee ? {
      companyId: employee.companyId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      departmentId: employee.departmentId || undefined,
      designationId: employee.designationId || undefined,
      roleLevelId: employee.roleLevelId || undefined,
      status: employee.status,
      joinDate: employee.joinDate,
      exitDate: employee.exitDate || undefined,
      attendanceType: employee.attendanceType || "regular",
      education: employee.education || [],
      experience: employee.experience || [],
      documents: employee.documents || [],
      ctc: employee.ctc || [],
      assets: employee.assets || [],
      bank: employee.bank || undefined,
      insurance: employee.insurance || undefined,
      statutory: employee.statutory || undefined,
    } : {
      companyId: "temp-company-id",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
      attendanceType: "regular",
      education: [],
      experience: [],
      documents: [],
      ctc: [],
      assets: [],
    },
  });

  const educationFields = useFieldArray({
    control: form.control,
    name: "education",
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const documentFields = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const ctcFields = useFieldArray({
    control: form.control,
    name: "ctc",
  });

  const assetFields = useFieldArray({
    control: form.control,
    name: "assets",
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const res = await apiRequest('POST', '/api/employees', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const res = await apiRequest('PATCH', `/api/employees/${employee?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEmployee) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-employee">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {isEdit ? "Edit Employee" : "Create Employee"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update employee information" : "Add a new employee to your organization"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
                <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
                <TabsTrigger value="education" data-testid="tab-education">Education</TabsTrigger>
                <TabsTrigger value="experience" data-testid="tab-experience">Experience</TabsTrigger>
                <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
                <TabsTrigger value="ctc" data-testid="tab-ctc">CTC</TabsTrigger>
                <TabsTrigger value="assets" data-testid="tab-assets">Assets</TabsTrigger>
                <TabsTrigger value="bank" data-testid="tab-bank">Bank</TabsTrigger>
                <TabsTrigger value="insurance" data-testid="tab-insurance">Insurance</TabsTrigger>
                <TabsTrigger value="statutory" data-testid="tab-statutory">Statutory</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-firstName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-lastName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-departmentId">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-designationId">
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {designations.map(desig => (
                              <SelectItem key={desig.id} value={desig.id}>{desig.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roleLevelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-roleLevelId">
                              <SelectValue placeholder="Select role level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rolesLevels.map(rl => (
                              <SelectItem key={rl.id} value={rl.id}>{rl.role} - {rl.level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="relieved">Relieved</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joinDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Join Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-joinDate"
                              >
                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exitDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Exit Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-exitDate"
                              >
                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attendanceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attendance Type</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} data-testid="input-attendanceType" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <div className="space-y-4">
                  {educationFields.fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Education {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => educationFields.remove(index)}
                          data-testid={`button-remove-education-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.degree`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Degree</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-education-${index}-degree`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institution</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-education-${index}-institution`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-education-${index}-year`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.grade`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Grade (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-education-${index}-grade`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => educationFields.append({ degree: "", institution: "", year: "", grade: "" })}
                    data-testid="button-add-education"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="space-y-4">
                  {experienceFields.fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Experience {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => experienceFields.remove(index)}
                          data-testid={`button-remove-experience-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`experience.${index}.company`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-experience-${index}-company`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.position`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-experience-${index}-position`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-experience-${index}-startDate`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-experience-${index}-endDate`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-experience-${index}-description`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => experienceFields.append({ company: "", position: "", startDate: "", endDate: "", description: "" })}
                    data-testid="button-add-experience"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4">
                  {documentFields.fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Document {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => documentFields.remove(index)}
                          data-testid={`button-remove-document-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`documents.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-document-${index}-name`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`documents.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-document-${index}-type`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`documents.${index}.size`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Size</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} data-testid={`input-document-${index}-size`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`documents.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-document-${index}-url`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`documents.${index}.uploadedAt`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Uploaded At</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-document-${index}-uploadedAt`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => documentFields.append({ name: "", type: "", size: 0, url: "", uploadedAt: new Date().toISOString() })}
                    data-testid="button-add-document"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="ctc" className="space-y-4">
                <div className="space-y-4">
                  {ctcFields.fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CTC Component {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => ctcFields.remove(index)}
                          data-testid={`button-remove-ctc-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`ctc.${index}.component`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Component</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-ctc-${index}-component`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ctc.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} data-testid={`input-ctc-${index}-amount`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ctc.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-ctc-${index}-frequency`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => ctcFields.append({ component: "", amount: 0, frequency: "" })}
                    data-testid="button-add-ctc"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add CTC Component
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="space-y-4">
                <div className="space-y-4">
                  {assetFields.fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asset {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => assetFields.remove(index)}
                          data-testid={`button-remove-asset-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`assets.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-asset-${index}-name`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assets.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-asset-${index}-type`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assets.${index}.serialNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Serial Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-asset-${index}-serialNumber`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assets.${index}.assignedDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Assigned Date</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-asset-${index}-assignedDate`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assets.${index}.returnDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Return Date (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid={`input-asset-${index}-returnDate`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => assetFields.append({ name: "", type: "", serialNumber: "", assignedDate: "", returnDate: "" })}
                    data-testid="button-add-asset"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="bank" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank.accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-bank-accountNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-bank-bankName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank.ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-bank-ifscCode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank.accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-bank-accountHolderName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance.provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance-provider" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insurance.policyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Number</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance-policyNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insurance.coverageAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coverage Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} data-testid="input-insurance-coverageAmount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insurance.startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance-startDate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insurance.endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance-endDate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="statutory" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="statutory.panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-statutory-panNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statutory.aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-statutory-aadharNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statutory.pfNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PF Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-statutory-pfNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statutory.esiNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ESI Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-statutory-esiNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statutory.uanNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UAN Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-statutory-uanNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [designationFilter, setDesignationFilter] = useState<string>("all");
  const [roleLevelFilter, setRoleLevelFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const { data: designations = [] } = useQuery<Designation[]>({
    queryKey: ['/api/designations'],
  });

  const { data: rolesLevels = [] } = useQuery<RoleLevel[]>({
    queryKey: ['/api/roles-levels'],
  });

  const getDepartmentName = (id: string | null) => {
    if (!id) return "N/A";
    return departments.find(d => d.id === id)?.name || "N/A";
  };

  const getDesignationName = (id: string | null) => {
    if (!id) return "N/A";
    return designations.find(d => d.id === id)?.name || "N/A";
  };

  const getRoleLevelName = (id: string | null) => {
    if (!id) return "N/A";
    const rl = rolesLevels.find(r => r.id === id);
    return rl ? `${rl.role} - ${rl.level}` : "N/A";
  };

  const filteredEmployees = employees.filter(emp => {
    if (statusFilter !== "all" && emp.status !== statusFilter) return false;
    if (departmentFilter !== "all" && emp.departmentId !== departmentFilter) return false;
    if (designationFilter !== "all" && emp.designationId !== designationFilter) return false;
    if (roleLevelFilter !== "all" && emp.roleLevelId !== roleLevelFilter) return false;
    return true;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const inactiveEmployees = employees.filter(e => e.status === "inactive").length;
  const relievedEmployees = employees.filter(e => e.status === "relieved").length;

  const statsCards = [
    { title: "Total", value: totalEmployees, icon: Users, color: "text-blue-600" },
    { title: "Active", value: activeEmployees, icon: UserCheck, color: "text-green-600" },
    { title: "InActive", value: inactiveEmployees, icon: UserX, color: "text-yellow-600" },
    { title: "Relieved", value: relievedEmployees, icon: User, color: "text-red-600" },
  ];

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedEmployee(null);
    }
    setDialogOpen(open);
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Employees</h2>
            <p className="text-muted-foreground">Manage your organization's employees</p>
          </div>
          <Button onClick={handleCreateEmployee} data-testid="button-create-employee">
            <Plus className="h-4 w-4 mr-2" />
            Create Employee
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase()}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase()}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="relieved">Relieved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger data-testid="select-filter-department">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={designationFilter} onValueChange={setDesignationFilter}>
                <SelectTrigger data-testid="select-filter-designation">
                  <SelectValue placeholder="Filter by designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {designations.map(desig => (
                    <SelectItem key={desig.id} value={desig.id}>{desig.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleLevelFilter} onValueChange={setRoleLevelFilter}>
                <SelectTrigger data-testid="select-filter-role">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {rolesLevels.map(rl => (
                    <SelectItem key={rl.id} value={rl.id}>{rl.role} - {rl.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Attendance Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                        <TableCell data-testid={`text-id-${employee.id}`}>{employee.id.slice(0, 8)}</TableCell>
                        <TableCell data-testid={`text-name-${employee.id}`}>
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell data-testid={`text-email-${employee.id}`}>{employee.email}</TableCell>
                        <TableCell data-testid={`text-phone-${employee.id}`}>{employee.phone}</TableCell>
                        <TableCell data-testid={`text-role-${employee.id}`}>{getRoleLevelName(employee.roleLevelId)}</TableCell>
                        <TableCell data-testid={`text-attendance-type-${employee.id}`}>
                          {employee.attendanceType}
                        </TableCell>
                        <TableCell data-testid={`text-department-${employee.id}`}>
                          {getDepartmentName(employee.departmentId)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            data-testid={`badge-status-${employee.id}`}
                            variant={
                              employee.status === "active" ? "default" : 
                              employee.status === "inactive" ? "secondary" : "destructive"
                            }
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditEmployee(employee)}
                              data-testid={`button-edit-${employee.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              data-testid={`button-delete-${employee.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        employee={selectedEmployee}
        departments={departments}
        designations={designations}
        rolesLevels={rolesLevels}
      />
    </DashboardLayout>
  );
}
