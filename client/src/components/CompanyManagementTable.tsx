import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";

export default function CompanyManagementTable() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    plan: "basic",
    maxEmployees: "50",
  });

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newCompany) => {
      return await apiRequest("POST", "/api/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company created successfully" });
      setOpen(false);
      setNewCompany({ name: "", email: "", plan: "basic", maxEmployees: "50" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/companies/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company status updated" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCompany);
  };

  const toggleStatus = (company: Company) => {
    const newStatus = company.status === "active" ? "inactive" : "active";
    toggleStatusMutation.mutate({ id: company.id, status: newStatus });
  };

  if (isLoading) {
    return <div>Loading companies...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Company Management
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-company">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>Add a new company to the HRMS platform</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    required
                    data-testid="input-company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                    required
                    data-testid="input-company-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-employees">Max Employees</Label>
                  <Input
                    id="max-employees"
                    type="number"
                    value={newCompany.maxEmployees}
                    onChange={(e) => setNewCompany({ ...newCompany, maxEmployees: e.target.value })}
                    data-testid="input-max-employees"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-company">
                  {createMutation.isPending ? "Creating..." : "Create Company"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Max Employees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{company.plan}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {company.maxEmployees}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={company.status === "active" ? "default" : "secondary"}>
                    {company.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={company.status === "active"}
                      onCheckedChange={() => toggleStatus(company)}
                      data-testid={`switch-status-${company.id}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {company.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {companies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No companies yet. Create your first company to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
