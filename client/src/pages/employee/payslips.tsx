import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, Download, Calendar, DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { type PayrollRecord } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

export default function EmployeePayslipsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");

  const { data: payrollRecords = [] } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll"],
  });

  // Filter for published payslips only
  const publishedPayslips = payrollRecords.filter(
    record => record.payslipPublished && record.status === "approved"
  );

  // Apply filters
  const filteredPayslips = publishedPayslips.filter(payslip => {
    const matchesYear = payslip.year === parseInt(selectedYear);
    const matchesMonth = selectedMonth === "all" || payslip.month === parseInt(selectedMonth);
    return matchesYear && matchesMonth;
  });

  const years = ["2025", "2024", "2023"];
  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month.toString())?.label || "";
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">My Payslips</h2>
          <p className="text-muted-foreground">View and download your salary statements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-payslips">{publishedPayslips.length}</div>
              <p className="text-xs text-muted-foreground">Available to view</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-year">
                {publishedPayslips.filter(p => p.year === new Date().getFullYear()).length}
              </div>
              <p className="text-xs text-muted-foreground">Payslips in {new Date().getFullYear()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-latest-salary">
                {publishedPayslips.length > 0 
                  ? `₹${publishedPayslips[0].netPay.toLocaleString()}`
                  : "N/A"
                }
              </div>
              <p className="text-xs text-muted-foreground">Net pay</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Payslip History</CardTitle>
                <CardDescription>View your salary statements</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]" data-testid="select-year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[150px]" data-testid="select-month">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayslips.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-payslips">No payslips available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayslips.map((payslip) => (
                  <Card key={payslip.id} data-testid={`payslip-${payslip.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {getMonthName(payslip.month)} {payslip.year}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Working Days: {payslip.workingDays} • Present: {payslip.presentDays}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div>
                            <p className="text-xs text-muted-foreground">Net Pay</p>
                            <p className="text-lg font-bold">₹{payslip.netPay.toLocaleString()}</p>
                          </div>
                          <Button size="sm" variant="outline" data-testid={`button-download-${payslip.id}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-sm">
                        <div>
                          <p className="text-muted-foreground">Gross Pay</p>
                          <p className="font-medium">₹{payslip.grossPay.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deductions</p>
                          <p className="font-medium text-red-600 dark:text-red-400">₹{payslip.totalDeductions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Published On</p>
                          <p className="font-medium">
                            {payslip.payslipPublishedAt 
                              ? format(new Date(payslip.payslipPublishedAt), "MMM dd, yyyy")
                              : "N/A"
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
