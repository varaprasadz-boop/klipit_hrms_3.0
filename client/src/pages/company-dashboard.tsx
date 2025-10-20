import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, TrendingUp, Settings, LogOut } from "lucide-react";

export default function CompanyDashboard() {
  const companyName = "My Company";
  const userEmail = localStorage.getItem("companyEmail") || "user@company.com";

  const stats = [
    {
      title: "Total Employees",
      value: "0",
      icon: Users,
      description: "Active employees",
    },
    {
      title: "Attendance Today",
      value: "0%",
      description: "Present today",
    },
    {
      title: "Pending Leaves",
      value: "0",
      icon: Calendar,
      description: "Awaiting approval",
    },
    {
      title: "Payroll This Month",
      value: "₹0",
      icon: DollarSign,
      description: "Total payroll",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Klipit HRMS WORLD</h1>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Company Admin</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button variant="outline" size="icon" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard! 🎉</h2>
          <p className="text-muted-foreground">
            Your account has been activated. Start managing your HR operations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon && <stat.icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" data-testid="button-add-employee">
                <Users className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-mark-attendance">
                <Calendar className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-process-payroll">
                <DollarSign className="mr-2 h-4 w-4" />
                Process Payroll
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-view-reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Set up your company profile</p>
                    <p className="text-muted-foreground">Add company details and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Add your employees</p>
                    <p className="text-muted-foreground">Import or manually add employee records</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Configure attendance & leave</p>
                    <p className="text-muted-foreground">Set up policies and rules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Start managing HR operations</p>
                    <p className="text-muted-foreground">Track attendance, process payroll, and more</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
