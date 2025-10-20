import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import CompanyManagementTable from "@/components/CompanyManagementTable";
import { LayoutDashboard, Building2, Users, Activity } from "lucide-react";
import type { Company } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", url: "/superadmin", icon: LayoutDashboard },
  { title: "Companies", url: "/superadmin/companies", icon: Building2 },
  { title: "All Users", url: "/superadmin/users", icon: Users },
  { title: "System Activity", url: "/superadmin/activity", icon: Activity },
];

export default function SuperAdminDashboard() {
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const activeCompanies = companies.filter(c => c.status === "active").length;
  const totalCompanies = companies.length;

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage all companies and system settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Companies"
            value={totalCompanies}
            icon={Building2}
            description="Registered companies"
          />
          <StatsCard
            title="Active Companies"
            value={activeCompanies}
            icon={Building2}
            description="Currently active"
            trend={{ value: `${activeCompanies} of ${totalCompanies}`, positive: true }}
          />
          <StatsCard
            title="Inactive Companies"
            value={totalCompanies - activeCompanies}
            icon={Building2}
            description="Temporarily disabled"
          />
        </div>

        <CompanyManagementTable />
      </div>
    </DashboardLayout>
  );
}
