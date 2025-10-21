import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="Klipit by Bova" data-testid="input-platform-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" defaultValue="support@klipit.com" data-testid="input-support-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-timezone">Default Timezone</Label>
              <Input id="default-timezone" defaultValue="UTC" data-testid="input-timezone" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Customer Registrations</Label>
                <p className="text-sm text-muted-foreground">Allow new companies to sign up</p>
              </div>
              <Switch defaultChecked data-testid="switch-registrations" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Show maintenance page to users</p>
              </div>
              <Switch data-testid="switch-maintenance" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send system email notifications</p>
              </div>
              <Switch defaultChecked data-testid="switch-emails" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" data-testid="input-session-timeout" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require 2FA for Admins</Label>
                <p className="text-sm text-muted-foreground">Two-factor authentication</p>
              </div>
              <Switch data-testid="switch-2fa" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button data-testid="button-save-settings">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
