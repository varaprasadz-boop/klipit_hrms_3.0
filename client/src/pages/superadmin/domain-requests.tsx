import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye } from "lucide-react";

const mockRequests = [
  { 
    id: 4, 
    user: "Oct Company Oct Company", 
    email: "octcompany@mailinator.com",
    domain: "octcompany", 
    status: "approved", 
    createdAt: "20-10-2025 08:16 AM" 
  },
  { 
    id: 3, 
    user: "Elon Musk", 
    email: "elon@mailinator.com",
    domain: "elonmusk", 
    status: "approved", 
    createdAt: "19-10-2025 08:55 PM" 
  },
  { 
    id: 2, 
    user: "Asif Ahmed", 
    email: "asifahmed715@gmail.com",
    domain: "codexhive", 
    status: "approved", 
    createdAt: "18-10-2025 09:05 PM" 
  },
  { 
    id: 1, 
    user: "Demo Customer", 
    email: "democustomer@tmvtshop.in",
    domain: "testdomain", 
    status: "approved", 
    createdAt: "18-10-2025 05:21 PM" 
  },
];

export default function DomainRequestsPage() {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-cyan-100 text-cyan-700",
      "bg-emerald-100 text-emerald-700",
      "bg-blue-100 text-blue-700",
      "bg-purple-100 text-purple-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Domain Requests</h2>
        <p className="text-muted-foreground">Review and approve custom domain requests</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select defaultValue="7">
            <SelectTrigger className="w-20" data-testid="select-page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Domain Request..." 
              className="pl-9"
              data-testid="input-search-domains"
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
              <TableHead>DOMAIN NAME</TableHead>
              <TableHead>CREATED AT</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRequests.map((request, index) => (
              <TableRow key={request.id} data-testid={`row-domain-${request.id}`}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {request.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs ${getAvatarColor(index)}`}>
                        {getInitials(request.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.user}</div>
                      <div className="text-xs text-muted-foreground">{request.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {request.domain}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.createdAt}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={request.status === "approved" ? "default" : "secondary"}
                    className={request.status === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" data-testid={`button-view-${request.id}`}>
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
          Showing {mockRequests.length} of {mockRequests.length} domain requests
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
