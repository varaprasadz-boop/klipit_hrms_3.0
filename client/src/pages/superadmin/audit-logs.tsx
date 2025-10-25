import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText } from "lucide-react";
import { format } from "date-fns";
import type { AuditLog, User, Company } from "@shared/schema";

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const getUserEmail = (userId: string | null) => {
    if (!userId) return "System";
    const user = users.find(u => u.id === userId);
    return user?.email || "Unknown";
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "N/A";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Unknown";
  };

  const filteredLogs = logs.filter(log => {
    const userEmail = getUserEmail(log.userId);
    const companyName = getCompanyName(log.companyId);
    
    return (
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Audit Logs</h2>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-logs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Loading audit logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground" data-testid="text-no-logs">
            {searchQuery ? "No logs match your search" : "No audit logs found"}
          </p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-sm">{getUserEmail(log.userId)}</TableCell>
                  <TableCell className="text-sm">{getCompanyName(log.companyId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                    {log.details || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
