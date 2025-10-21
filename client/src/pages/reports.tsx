import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, FileText, Users, Calendar, DollarSign, Receipt,
  TrendingUp, Clock, Umbrella, BarChart3, PieChart, FileSpreadsheet,
  LayoutDashboard, Target, Building2, Star, Workflow, 
  Megaphone, UserPlus, Shield, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Employee, PayrollRecord } from "@shared/schema";

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
      { title: "Companies", url: "/dashboard/admin/organization/companies" },
      { title: "Branches", url: "/dashboard/admin/organization/branches" },
      { title: "Departments", url: "/dashboard/admin/organization/departments" },
      { title: "Designations", url: "/dashboard/admin/organization/designations" },
    ]
  },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/admin/leave", icon: Umbrella },
  { title: "Workflows", url: "/dashboard/admin/workflows", icon: Workflow },
  { title: "Expense Dashboard", url: "/dashboard/admin/expenses", icon: Receipt },
  { 
    title: "Masters", 
    icon: Star,
    subItems: [
      { title: "Roles & Levels", url: "/dashboard/admin/masters/roles-levels" },
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
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

type ReportCategory = {
  id: string;
  title: string;
  description: string;
  icon: any;
  reports: {
    id: string;
    name: string;
    description: string;
    formats: string[];
  }[];
};

const reportCategories: ReportCategory[] = [
  {
    id: "employee",
    title: "Employee Reports",
    description: "Workforce and demographic reports",
    icon: Users,
    reports: [
      {
        id: "employee-master",
        name: "Employee Master List",
        description: "Complete list of all employees with details",
        formats: ["PDF", "Excel", "CSV"],
      },
      {
        id: "headcount",
        name: "Headcount Report",
        description: "Employee count by department, designation, and status",
        formats: ["PDF", "Excel"],
      },
      {
        id: "new-joiners",
        name: "New Joiners Report",
        description: "Employees who joined in selected period",
        formats: ["PDF", "Excel"],
      },
      {
        id: "employee-directory",
        name: "Employee Directory",
        description: "Contact information and organizational chart",
        formats: ["PDF", "Excel"],
      },
    ],
  },
  {
    id: "attendance",
    title: "Attendance Reports",
    description: "Attendance tracking and time management",
    icon: Clock,
    reports: [
      {
        id: "monthly-attendance",
        name: "Monthly Attendance Summary",
        description: "Present, absent, and late records for the month",
        formats: ["PDF", "Excel", "CSV"],
      },
      {
        id: "overtime",
        name: "Overtime Report",
        description: "Overtime hours by employee and department",
        formats: ["PDF", "Excel"],
      },
      {
        id: "late-arrivals",
        name: "Late Arrivals Report",
        description: "Employees who arrived late in selected period",
        formats: ["PDF", "Excel"],
      },
      {
        id: "shift-wise-attendance",
        name: "Shift-wise Attendance",
        description: "Attendance breakdown by shifts",
        formats: ["PDF", "Excel"],
      },
    ],
  },
  {
    id: "leave",
    title: "Leave Reports",
    description: "Leave balance and utilization",
    icon: Umbrella,
    reports: [
      {
        id: "leave-balance",
        name: "Leave Balance Report",
        description: "Current leave balance for all employees",
        formats: ["PDF", "Excel", "CSV"],
      },
      {
        id: "leave-taken",
        name: "Leave Taken Report",
        description: "Leaves taken in selected period by type",
        formats: ["PDF", "Excel"],
      },
      {
        id: "pending-leave-requests",
        name: "Pending Leave Requests",
        description: "All pending leave approval requests",
        formats: ["PDF", "Excel"],
      },
      {
        id: "leave-encashment",
        name: "Leave Encashment Report",
        description: "Leave encashment calculations",
        formats: ["PDF", "Excel"],
      },
    ],
  },
  {
    id: "payroll",
    title: "Payroll Reports",
    description: "Salary and compensation reports",
    icon: DollarSign,
    reports: [
      {
        id: "payroll-summary",
        name: "Monthly Payroll Summary",
        description: "Total salary, deductions, and net pay by department",
        formats: ["PDF", "Excel", "CSV"],
      },
      {
        id: "salary-register",
        name: "Salary Register",
        description: "Detailed salary breakdown for all employees",
        formats: ["PDF", "Excel"],
      },
      {
        id: "tax-deduction",
        name: "Tax Deduction Report",
        description: "Income tax and other statutory deductions",
        formats: ["PDF", "Excel"],
      },
      {
        id: "bank-transfer",
        name: "Bank Transfer Report",
        description: "Bank account details for salary transfer",
        formats: ["Excel", "CSV"],
      },
    ],
  },
  {
    id: "expense",
    title: "Expense Reports",
    description: "Expense claims and reimbursements",
    icon: Receipt,
    reports: [
      {
        id: "expense-summary",
        name: "Expense Claims Summary",
        description: "Total expense claims by category and status",
        formats: ["PDF", "Excel", "CSV"],
      },
      {
        id: "pending-approvals",
        name: "Pending Approvals Report",
        description: "Expense claims awaiting approval",
        formats: ["PDF", "Excel"],
      },
      {
        id: "reimbursement-status",
        name: "Reimbursement Status",
        description: "Approved claims pending disbursement",
        formats: ["PDF", "Excel"],
      },
      {
        id: "expense-analytics",
        name: "Expense Analytics",
        description: "Expense trends and category-wise analysis",
        formats: ["PDF", "Excel"],
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance Reports",
    description: "Statutory and regulatory reports",
    icon: Shield,
    reports: [
      {
        id: "pf-report",
        name: "PF Contribution Report",
        description: "Provident fund contributions for employees",
        formats: ["PDF", "Excel"],
      },
      {
        id: "esi-report",
        name: "ESI Report",
        description: "Employee State Insurance contributions",
        formats: ["PDF", "Excel"],
      },
      {
        id: "professional-tax",
        name: "Professional Tax Report",
        description: "Professional tax deductions",
        formats: ["PDF", "Excel"],
      },
      {
        id: "form16",
        name: "Form 16 Generation",
        description: "Annual tax certificate for employees",
        formats: ["PDF"],
      },
    ],
  },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: payrollRecords } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll"],
  });

  const handleGenerateReport = (reportId: string, format: string) => {
    toast({
      title: "Generating Report",
      description: `Preparing ${reportId} report in ${format} format...`,
    });

    // TODO: Implement actual report generation
    console.log("Generate report:", reportId, format, {
      month: selectedMonth,
      year: selectedYear,
      department: selectedDepartment,
    });

    setTimeout(() => {
      toast({
        title: "Download Started",
        description: `Your ${format} report is ready for download`,
      });
    }, 1500);
  };

  const totalEmployees = employees?.length || 0;
  const publishedPayslips = payrollRecords?.filter(p => p.payslipPublished)?.length || 0;

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-1">Reports</h2>
          <p className="text-muted-foreground">
            Generate and export HR reports for analysis and compliance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active workforce</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Available</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportCategories.reduce((acc, cat) => acc + cat.reports.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across 6 categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payslips Generated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedPayslips}</div>
              <p className="text-xs text-muted-foreground">Published this year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">PDF, Excel, CSV</p>
            </CardContent>
          </Card>
        </div>

        {/* Global Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Select period and department to filter report data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger data-testid="select-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger data-testid="select-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(5)].map((_, i) => {
                      const year = currentYear - i;
                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Categories */}
        <div className="space-y-6">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {category.reports.map((report) => (
                      <Card key={report.id} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-base">{report.name}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {report.description}
                              </CardDescription>
                            </div>
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {report.formats.map((format) => (
                              <Button
                                key={format}
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateReport(report.id, format)}
                                data-testid={`button-generate-${report.id}-${format.toLowerCase()}`}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                {format}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used report combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleGenerateReport("monthly-pack", "ZIP")}
                data-testid="button-monthly-pack"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Monthly Report Pack
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateReport("compliance-pack", "ZIP")}
                data-testid="button-compliance-pack"
              >
                <Shield className="h-4 w-4 mr-2" />
                Download Compliance Reports
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateReport("executive-summary", "PDF")}
                data-testid="button-executive-summary"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Executive Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
