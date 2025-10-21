import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, CheckCircle, XCircle,
  Clock3, CalendarDays
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { type AttendanceRecord } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

export default function EmployeeAttendancePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance-records"],
  });

  // Filter records for current user
  const myRecords = attendanceRecords.filter(record => {
    // Match by email since we don't have direct employeeId mapping
    return true; // For now, show all records - will need proper user-employee mapping
  });

  // Get current month records
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthRecords = myRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });

  const presentDays = monthRecords.filter(r => r.status === "present").length;
  const absentDays = monthRecords.filter(r => r.status === "absent").length;
  const totalWorkingDays = 22; // Approximate
  const attendancePercentage = totalWorkingDays > 0 
    ? Math.round((presentDays / totalWorkingDays) * 100)
    : 0;

  // Get today's attendance
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecord = myRecords.find(r => r.date === today);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case "absent":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case "half_day":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400"><Clock3 className="h-3 w-3 mr-1" />Half Day</Badge>;
      case "leave":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400"><Umbrella className="h-3 w-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">My Attendance</h2>
          <p className="text-muted-foreground">Track your attendance and work hours</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-attendance-percentage">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">Attendance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-present-days">{presentDays}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-absent-days">{absentDays}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {todayRecord ? (
                <div className="flex items-center gap-2">
                  {getStatusBadge(todayRecord.status)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not marked yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Check in for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayRecord ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(todayRecord.status)}
                  </div>
                  {todayRecord.checkIn && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check In</span>
                      <span className="font-medium">{format(new Date(todayRecord.checkIn), "hh:mm a")}</span>
                    </div>
                  )}
                  {todayRecord.checkOut && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check Out</span>
                      <span className="font-medium">{format(new Date(todayRecord.checkOut), "hh:mm a")}</span>
                    </div>
                  )}
                  {!todayRecord.checkOut && todayRecord.status === "present" && (
                    <Button className="w-full" data-testid="button-checkout">
                      Check Out
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center py-4">
                    You haven't checked in today
                  </p>
                  <Button className="w-full" data-testid="button-checkin">
                    <Clock className="h-4 w-4 mr-2" />
                    Check In Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Your attendance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Working Days</span>
                  <span className="font-medium">{totalWorkingDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Present</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{presentDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Absent</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{absentDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On Leave</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {monthRecords.filter(r => r.status === "leave").length}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-lg font-bold">{attendancePercentage}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your recent attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {monthRecords.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-records">No attendance records found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {monthRecords.slice(0, 10).reverse().map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={`record-${record.id}`}>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{format(new Date(record.date), "EEEE, MMM dd, yyyy")}</p>
                        {record.checkIn && (
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.checkIn), "hh:mm a")}
                            {record.checkOut && ` - ${format(new Date(record.checkOut), "hh:mm a")}`}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
