import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Employee, Department, Designation } from "@shared/schema";

export default function EmployeeTable() {
  const [search, setSearch] = useState("");

  // Fetch employees from API
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Fetch departments for mapping IDs to names
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch designations for mapping IDs to names
  const { data: designations = [] } = useQuery<Designation[]>({
    queryKey: ["/api/designations"],
  });

  // Create lookup maps for departments and designations
  const departmentMap = useMemo(() => {
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
  }, [departments]);

  const designationMap = useMemo(() => {
    return designations.reduce((acc, desig) => {
      acc[desig.id] = desig.name;
      return acc;
    }, {} as Record<string, string>);
  }, [designations]);

  // Filter employees based on search
  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`;
      const department = emp.departmentId ? departmentMap[emp.departmentId] || "" : "";
      const designation = emp.designationId ? designationMap[emp.designationId] || "" : "";
      
      const searchLower = search.toLowerCase();
      return (
        fullName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        department.toLowerCase().includes(searchLower) ||
        designation.toLowerCase().includes(searchLower)
      );
    });
  }, [employees, search, departmentMap, designationMap]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Employee Directory
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-employees"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? "No employees found matching your search" : "No employees yet"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => {
                const fullName = `${emp.firstName} ${emp.lastName}`;
                const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
                const department = emp.departmentId ? departmentMap[emp.departmentId] : "—";
                const designation = emp.designationId ? designationMap[emp.designationId] : "—";
                
                return (
                  <TableRow key={emp.id} className="hover-elevate" data-testid={`row-employee-${emp.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium" data-testid={`text-name-${emp.id}`}>{fullName}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-email-${emp.id}`}>{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-department-${emp.id}`}>{department}</TableCell>
                    <TableCell data-testid={`text-designation-${emp.id}`}>{designation}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={emp.status === "active" ? "default" : "secondary"}
                        data-testid={`badge-status-${emp.id}`}
                      >
                        {emp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
