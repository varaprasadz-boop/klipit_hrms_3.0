import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AttendanceRecord, Employee, Shift } from "@shared/schema";
import { format, parse } from "date-fns";
import { Download, Calendar, Users, LayoutDashboard, Clock, Umbrella, Workflow, Receipt, Megaphone, FileText, UserPlus, Shield, BarChart3, Settings, Target, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Attendance() {
  const [dateFilter, setDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: attendanceRecords = [], isLoading: recordsLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/attendance-records'],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ['/api/shifts'],
  });

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
  };

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return "N/A";
    const shift = shifts.find(s => s.id === shiftId);
    return shift ? shift.name : "N/A";
  };

  const calculateDuration = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return "—";
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "—";
    return format(new Date(date), "hh:mm a");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (dateFilter && record.date !== dateFilter) return false;
    if (employeeFilter !== "all" && record.employeeId !== employeeFilter) return false;
    if (statusFilter !== "all" && record.status !== statusFilter) return false;
    return true;
  });

  const downloadCSV = () => {
    const headers = ["ID", "Date", "Employee", "Shift", "Check In", "Check Out", "Duration", "Status", "Location", "Notes"];
    const csvData = filteredRecords.map(record => [
      record.id.slice(0, 8),
      formatDate(record.date),
      getEmployeeName(record.employeeId),
      getShiftName(record.shiftId),
      formatTime(record.checkIn),
      formatTime(record.checkOut),
      calculateDuration(record.checkIn, record.checkOut),
      record.status,
      record.location || "—",
      record.notes || "—"
    ]);

    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Attendance Management</h2>
            <p className="text-muted-foreground">Track and manage employee attendance</p>
          </div>
          <Button 
            onClick={downloadCSV} 
            disabled={filteredRecords.length === 0}
            data-testid="button-download-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="date-filter">Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  data-testid="input-filter-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-filter">Employee</Label>
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger id="employee-filter" data-testid="select-filter-employee">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" data-testid="select-filter-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
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
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>First Check-In</TableHead>
                    <TableHead>Last Check-Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} data-testid={`row-attendance-${record.id}`}>
                        <TableCell data-testid={`text-id-${record.id}`}>{record.id.slice(0, 8)}</TableCell>
                        <TableCell data-testid={`text-date-${record.id}`}>{formatDate(record.date)}</TableCell>
                        <TableCell data-testid={`text-employee-${record.id}`}>{getEmployeeName(record.employeeId)}</TableCell>
                        <TableCell data-testid={`text-shift-${record.id}`}>{getShiftName(record.shiftId)}</TableCell>
                        <TableCell data-testid={`text-checkin-${record.id}`}>{formatTime(record.checkIn)}</TableCell>
                        <TableCell data-testid={`text-checkout-${record.id}`}>{formatTime(record.checkOut)}</TableCell>
                        <TableCell data-testid={`text-duration-${record.id}`}>{calculateDuration(record.checkIn, record.checkOut)}</TableCell>
                        <TableCell>
                          <Badge 
                            data-testid={`badge-status-${record.id}`}
                            variant={
                              record.status === "present" ? "default" : 
                              record.status === "pending" ? "secondary" : "destructive"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-location-${record.id}`}>{record.location || "—"}</TableCell>
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
