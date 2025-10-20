import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee, Department, Designation, RoleLevel } from "@shared/schema";
import { 
  Users, UserPlus, UserCheck, UserX, User, Plus, Pencil, Trash2, 
  Building2, Briefcase, Star
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
  BarChart3, Settings, Target, Building2 as Building2Icon, Star as StarIcon
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
    icon: Building2Icon,
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
  { title: "Expenses", url: "/dashboard/admin/expenses", icon: Receipt },
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

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [designationFilter, setDesignationFilter] = useState<string>("all");
  const [roleLevelFilter, setRoleLevelFilter] = useState<string>("all");

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

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Employees</h2>
            <p className="text-muted-foreground">Manage your organization's employees</p>
          </div>
          <Button data-testid="button-create-employee">
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
    </DashboardLayout>
  );
}
