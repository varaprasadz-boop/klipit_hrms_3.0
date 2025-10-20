import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Users, Clock, Umbrella, Workflow, Receipt, Megaphone, FileText, UserPlus, Shield, BarChart3, Settings, Building2, Mail, Phone, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
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
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company-info");

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Settings</h2>
          <p className="text-muted-foreground">Manage your company settings and configurations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company-info" data-testid="tab-company-info">
              <Building2 className="h-4 w-4 mr-2" />
              Company Info
            </TabsTrigger>
            <TabsTrigger value="email-smtp" data-testid="tab-email-smtp">
              <Mail className="h-4 w-4 mr-2" />
              Email SMTP
            </TabsTrigger>
            <TabsTrigger value="contact-info" data-testid="tab-contact-info">
              <Phone className="h-4 w-4 mr-2" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="package-details" data-testid="tab-package-details">
              <Package className="h-4 w-4 mr-2" />
              Package Details
            </TabsTrigger>
          </TabsList>

          {/* Company Info Tab */}
          <TabsContent value="company-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Enter company name" data-testid="input-company-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-code">Company Code</Label>
                    <Input id="company-code" placeholder="e.g., COMP001" data-testid="input-company-code" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registration-number">Registration Number</Label>
                    <Input id="registration-number" placeholder="Enter registration number" data-testid="input-registration-number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID / GST Number</Label>
                    <Input id="tax-id" placeholder="Enter tax ID" data-testid="input-tax-id" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-address">Company Address</Label>
                  <Textarea id="company-address" placeholder="Enter complete address" rows={3} data-testid="input-company-address" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" data-testid="input-city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" data-testid="input-state" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input id="postal-code" placeholder="Postal Code" data-testid="input-postal-code" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Country" data-testid="input-country" />
                </div>

                <Button onClick={() => handleSave("Company Information")} data-testid="button-save-company-info">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email SMTP Tab */}
          <TabsContent value="email-smtp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email SMTP Configuration</CardTitle>
                <CardDescription>Configure your email server settings for sending emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="e.g., smtp.gmail.com" data-testid="input-smtp-host" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="e.g., 587" type="number" data-testid="input-smtp-port" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input id="smtp-username" placeholder="Enter SMTP username" data-testid="input-smtp-username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input id="smtp-password" type="password" placeholder="Enter SMTP password" data-testid="input-smtp-password" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input id="from-email" type="email" placeholder="noreply@company.com" data-testid="input-from-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From Name</Label>
                    <Input id="from-name" placeholder="Company Name" data-testid="input-from-name" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="use-ssl" className="cursor-pointer">Use SSL/TLS</Label>
                  <input type="checkbox" id="use-ssl" className="h-4 w-4" data-testid="checkbox-use-ssl" />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSave("Email SMTP")} data-testid="button-save-smtp">
                    Save Settings
                  </Button>
                  <Button variant="outline" data-testid="button-test-smtp">
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Contact Information</CardTitle>
                <CardDescription>Manage your company's contact details</CardDescription>
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

                <Button onClick={() => handleSave("Contact Information")} data-testid="button-save-contact">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Package Details Tab */}
          <TabsContent value="package-details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>HRMS Package Details</CardTitle>
                <CardDescription>View your current subscription and package information</CardDescription>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
