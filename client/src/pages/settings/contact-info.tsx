import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Clock, Umbrella, Workflow, Receipt, Megaphone, FileText, UserPlus, Shield, BarChart3, Settings, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function ContactInfoSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Contact information has been updated successfully.",
    });
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Company Contact Information</h2>
          <p className="text-muted-foreground">Manage your company's contact details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Update company contact information and social links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-email">Primary Email</Label>
                <Input id="primary-email" type="email" placeholder="contact@company.com" data-testid="input-primary-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" placeholder="support@company.com" data-testid="input-support-email" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-phone">Primary Phone</Label>
                <Input id="primary-phone" type="tel" placeholder="+1 (555) 123-4567" data-testid="input-primary-phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternate-phone">Alternate Phone</Label>
                <Input id="alternate-phone" type="tel" placeholder="+1 (555) 987-6543" data-testid="input-alternate-phone" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" placeholder="https://www.company.com" data-testid="input-website" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/company/..." data-testid="input-linkedin" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hr-contact-name">HR Contact Name</Label>
                <Input id="hr-contact-name" placeholder="Enter HR contact name" data-testid="input-hr-contact-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hr-contact-email">HR Contact Email</Label>
                <Input id="hr-contact-email" type="email" placeholder="hr@company.com" data-testid="input-hr-contact-email" />
              </div>
            </div>

            <Button onClick={handleSave} data-testid="button-save-contact">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
