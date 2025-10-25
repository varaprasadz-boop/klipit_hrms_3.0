import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Check, X, Skeleton as SkeletonIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DomainRequestsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<Company | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);

  const { data: requests, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/admin/subdomain-requests"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/subdomain-requests/${id}/approve`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subdomain-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Request Approved",
        description: "The subdomain request has been approved successfully.",
      });
      setSelectedRequest(null);
      setDialogAction(null);
    },
    onError: (error: any) => {
      console.error("Approve error:", error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to approve subdomain request.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/subdomain-requests/${id}/reject`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subdomain-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Request Rejected",
        description: "The subdomain request has been rejected.",
      });
      setSelectedRequest(null);
      setDialogAction(null);
    },
    onError: (error: any) => {
      console.error("Reject error:", error);
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "Failed to reject subdomain request.",
      });
    },
  });

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

  const filteredRequests = requests?.filter((req) => {
    const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.subdomain?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.subdomainStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleApprove = (request: Company) => {
    setSelectedRequest(request);
    setDialogAction("approve");
  };

  const handleReject = (request: Company) => {
    setSelectedRequest(request);
    setDialogAction("reject");
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    if (dialogAction === "approve") {
      approveMutation.mutate(selectedRequest.id);
    } else if (dialogAction === "reject") {
      rejectMutation.mutate(selectedRequest.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Domain Requests</h2>
        <p className="text-muted-foreground">Review and approve custom domain requests</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-domains"
            />
          </div>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>COMPANY</TableHead>
              <TableHead>DOMAIN NAME</TableHead>
              <TableHead>REQUESTED AT</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No domain requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request, index) => (
                <TableRow key={request.id} data-testid={`row-domain-${request.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`text-xs ${getAvatarColor(index)}`}>
                          {getInitials(request.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-xs text-muted-foreground">{request.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.subdomain}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.subdomainRequestedAt ? new Date(request.subdomainRequestedAt).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        request.subdomainStatus === "approved" ? "default" :
                        request.subdomainStatus === "rejected" ? "destructive" : "secondary"
                      }
                      className={
                        request.subdomainStatus === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                        request.subdomainStatus === "pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" : ""
                      }
                    >
                      {request.subdomainStatus?.charAt(0).toUpperCase() + (request.subdomainStatus?.slice(1) || "")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {request.subdomainStatus === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleApprove(request)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-approve-${request.id}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReject(request)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-reject-${request.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRequests.length} domain request{filteredRequests.length !== 1 ? "s" : ""}
        </p>
      </div>

      <AlertDialog open={dialogAction !== null} onOpenChange={() => { setDialogAction(null); setSelectedRequest(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve" ? "Approve Domain Request" : "Reject Domain Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "approve" 
                ? `Are you sure you want to approve the subdomain "${selectedRequest?.subdomain}" for ${selectedRequest?.name}?`
                : `Are you sure you want to reject the subdomain request "${selectedRequest?.subdomain}" from ${selectedRequest?.name}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {dialogAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
