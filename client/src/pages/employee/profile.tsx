import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, Mail, Phone, MapPin,
  Briefcase, Building2, Calendar, Edit
} from "lucide-react";
import { format } from "date-fns";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

export default function EmployeeProfilePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const mockProfile = {
    firstName: user.name?.split(" ")[0] || "Employee",
    lastName: user.name?.split(" ")[1] || "User",
    email: user.email || "employee@company.com",
    phone: "+1-555-0100",
    department: user.department || "Engineering",
    position: user.position || "Software Engineer",
    employeeId: "EMP001",
    joinDate: "2022-01-15",
    status: "active",
    address: "123 Main Street, City, State 12345",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">My Profile</h2>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6 flex-wrap">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(`${mockProfile.firstName} ${mockProfile.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold">
                    {mockProfile.firstName} {mockProfile.lastName}
                  </h3>
                  <p className="text-muted-foreground">{mockProfile.position}</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">
                    <span className="capitalize">{mockProfile.status}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Employee ID: {mockProfile.employeeId}
                  </span>
                </div>
              </div>
              <Button variant="outline" data-testid="button-edit-profile">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.firstName} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.lastName} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.email} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.phone} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.address} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Your work information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.employeeId} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.department} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <Input value={mockProfile.position} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Join Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input value={format(new Date(mockProfile.joinDate), "MMM dd, yyyy")} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">
                    <span className="capitalize">{mockProfile.status}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button data-testid="button-change-password">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
