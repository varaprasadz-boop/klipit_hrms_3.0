import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, Filter, Users, UserCheck, UserX, Clock, Eye, Calendar } from "lucide-react";
import type { Company } from "@shared/schema";

export default function CustomersPage() {
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const totalCustomers = companies.length;
  const verifiedCustomers = companies.filter(c => c.status === "active").length;
  const duplicateCustomers = 0;
  const pendingVerification = companies.filter(c => c.status === "inactive").length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Customers</h2>
          <p className="text-muted-foreground">Manage all customer companies</p>
        </div>
        <Button data-testid="button-add-customer">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-green-600 mt-1">100%</p>
            <p className="text-xs text-muted-foreground mt-1">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCustomers}</div>
            <p className="text-xs text-green-600 mt-1">+{Math.round((verifiedCustomers / totalCustomers) * 100)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Recent analytics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicate Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duplicateCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">0%</p>
            <p className="text-xs text-muted-foreground mt-1">Recent analytics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerification}</div>
            <p className="text-xs text-orange-600 mt-1">+{Math.round((pendingVerification / totalCustomers) * 100)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Recent analytics</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select defaultValue="10">
            <SelectTrigger className="w-20" data-testid="select-page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-40" data-testid="select-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-40" data-testid="select-plan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" data-testid="button-date-filter">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search User..." 
              className="pl-9"
              data-testid="input-search-customers"
            />
          </div>
          <Button variant="outline" data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>USER</TableHead>
              <TableHead>SUBSCRIPTION</TableHead>
              <TableHead>PLAN</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead className="text-center">VERIFIED</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company, index) => (
              <TableRow key={company.id} data-testid={`row-customer-${index + 1}`}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {companies.length - index}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{company.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={company.status === "active" ? "default" : "secondary"}
                    className={company.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                  >
                    {company.status === "active" ? "Subscribed" : "No Subscription"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="font-normal">
                      {company.plan || "Basic"}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      <div>Validity: {new Date(company.createdAt).toLocaleDateString()}</div>
                      <div>Users: Included 1, Additional {company.maxEmployees || "0"}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {company.email}
                </TableCell>
                <TableCell className="text-center">
                  {company.status === "active" ? (
                    <UserCheck className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <UserX className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" data-testid={`button-view-${index + 1}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {companies.length} of {totalCustomers} customers
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
