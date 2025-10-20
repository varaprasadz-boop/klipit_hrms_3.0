import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Users, Clock, Umbrella, Workflow, Receipt, Megaphone, FileText, UserPlus, Shield, BarChart3, Settings, Target } from "lucide-react";

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
  { title: "Employees", url: "/dashboard/admin/employees", icon: Users },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/admin/leave", icon: Umbrella },
  { title: "Workflows", url: "/dashboard/admin/workflows", icon: Workflow },
  { title: "Expenses", url: "/dashboard/admin/expenses", icon: Receipt },
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

export default function PackageDetailsSettings() {
  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">HRMS Package Details</h2>
          <p className="text-muted-foreground">View your current subscription and package information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active HRMS plan details and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Current Plan</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">Basic</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Subscription Status</Label>
                <div className="text-2xl font-bold text-green-600">Active</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Plan Duration</Label>
                <div className="text-lg font-semibold">3 Months</div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Start Date</Label>
                <div className="text-lg font-semibold">Oct 20, 2025</div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Expiry Date</Label>
                <div className="text-lg font-semibold">Jan 20, 2026</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Base Price</Label>
                <div className="text-lg font-semibold">₹50</div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Additional Users</Label>
                <div className="text-lg font-semibold">6</div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Total Amount Paid</Label>
                <div className="text-lg font-semibold text-primary">₹230</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Included Users</Label>
              <div className="text-lg font-semibold">1 User (Base Plan)</div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Plan Features</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Employee Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Attendance Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Leave Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Payslips</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Reports & Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Workflows</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button data-testid="button-upgrade-plan">
                Upgrade Plan
              </Button>
              <Button variant="outline" data-testid="button-view-invoices">
                View Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
