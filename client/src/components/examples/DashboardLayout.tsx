import DashboardLayout from '../DashboardLayout'
import { LayoutDashboard, Users, Clock } from 'lucide-react'

export default function DashboardLayoutExample() {
  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Employees", url: "/employees", icon: Users },
    { title: "Attendance", url: "/attendance", icon: Clock },
  ];

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard Content</h2>
        <p className="text-muted-foreground">This is where the main content goes.</p>
      </div>
    </DashboardLayout>
  );
}
