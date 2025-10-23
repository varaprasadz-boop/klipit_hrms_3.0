import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/StatsCard";
import CompanyManagementTable from "@/components/CompanyManagementTable";
import { Building2, Users, TrendingUp } from "lucide-react";
import type { Company } from "@shared/schema";

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  monthlyRevenue: number;
}

export default function SuperAdminDashboardPage() {
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/superadmin/stats"],
  });

  const activeCompanies = companies.filter(c => c.status === "active").length;
  const totalCompanies = companies.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your super admin control panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Customers"
          value={totalCompanies}
          icon={Building2}
          description="Registered companies"
        />
        <StatsCard
          title="Active Customers"
          value={activeCompanies}
          icon={Building2}
          description="Currently active"
          trend={{ value: `${activeCompanies} of ${totalCompanies}`, positive: true }}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description="All platform users"
        />
        <StatsCard
          title="Revenue"
          value={`₹${stats?.monthlyRevenue?.toLocaleString('en-IN') ?? '0'}`}
          icon={TrendingUp}
          description="This month"
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Companies</h3>
        <CompanyManagementTable />
      </div>
    </div>
  );
}
