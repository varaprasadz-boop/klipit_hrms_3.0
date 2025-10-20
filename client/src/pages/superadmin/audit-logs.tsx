import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const mockLogs = [
  { 
    id: 1, 
    timestamp: "2024-10-20 14:32:15", 
    user: "superadmin@hrmsworld.com", 
    action: "Company Created", 
    details: "Created company: Tech Solutions Inc",
    ip: "192.168.1.100"
  },
  { 
    id: 2, 
    timestamp: "2024-10-20 14:15:42", 
    user: "admin@techsolutions.com", 
    action: "User Added", 
    details: "Added employee: jane@techsolutions.com",
    ip: "192.168.1.50"
  },
  { 
    id: 3, 
    timestamp: "2024-10-20 13:45:22", 
    user: "superadmin@hrmsworld.com", 
    action: "Plan Modified", 
    details: "Updated Premium plan pricing",
    ip: "192.168.1.100"
  },
  { 
    id: 4, 
    timestamp: "2024-10-20 12:30:10", 
    user: "admin@marketingpro.com", 
    action: "Settings Changed", 
    details: "Modified company settings",
    ip: "203.45.67.89"
  },
];

export default function AuditLogsPage() {
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
            data-testid="input-search-logs"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                <TableCell className="text-sm">{log.user}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                <TableCell className="font-mono text-sm">{log.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
