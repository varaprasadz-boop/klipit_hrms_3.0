import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface OfflineRequest {
  id: number;
  companyId: number;
  user: {
    name: string;
    email: string;
    initials: string;
    avatarColor: string;
  };
  type: string;
  plan: {
    name: string;
    duration: string;
    includedUsers: number;
  };
  additionalUsers: number;
  totalAmount: number;
  orderId: string | null;
  status: "pending" | "active" | "rejected";
  paymentMethod: string;
}

export default function OfflineRequestsPage() {
  const [pageSize, setPageSize] = useState("7");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<OfflineRequest | null>(null);
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<OfflineRequest[]>({
    queryKey: ["/api/payment-requests"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/payment-requests/${id}/approve`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      toast({
        title: "Request Approved",
        description: `Offline payment request has been approved and activated.`,
      });
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/payment-requests/${id}/reject`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      toast({
        title: "Request Rejected",
        description: `Offline payment request has been rejected.`,
      });
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-yellow-900 hover:bg-yellow-400";
      case "active":
        return "bg-green-400 text-green-900 hover:bg-green-400";
      case "rejected":
        return "bg-red-400 text-red-900 hover:bg-red-400";
      default:
        return "bg-gray-400 text-gray-900";
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate(selectedRequest.companyId);
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate(selectedRequest.companyId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Offline Requests</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-16" data-testid="select-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Search Offline Requests"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="input-search"
              />
              <Button variant="outline" size="icon" data-testid="button-export">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">USER</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">TYPE</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">PLAN</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ADDITIONAL USERS</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">TOTAL AMOUNT</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ORDER ID</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">STATUS</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover-elevate">
                      <td className="py-4 px-2">{request.id}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${request.user.avatarColor} text-white font-semibold`}>
                              {request.user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{request.user.name}</div>
                            <div className="text-sm text-muted-foreground">{request.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">{request.type}</td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">{request.plan.name}</div>
                          <div className="text-sm">
                            <span className="font-semibold">Duration:</span>
                            <br />
                            {request.plan.duration}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">Included Users:</span>
                            <br />
                            {request.plan.includedUsers}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">{request.additionalUsers}</td>
                      <td className="py-4 px-2">{request.totalAmount}</td>
                      <td className="py-4 px-2">{request.orderId || "N/A"}</td>
                      <td className="py-4 px-2">
                        <Badge className={`${getStatusColor(request.status)} capitalize`}>
                          {request.status === "active" ? "Approved" : request.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRequest(request)}
                          data-testid={`button-view-${request.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Offline Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`${selectedRequest.user.avatarColor} text-white font-semibold text-lg`}>
                    {selectedRequest.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">{selectedRequest.user.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedRequest.user.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Request ID:</span>
                  <div className="font-medium">{selectedRequest.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <div className="font-medium">{selectedRequest.type}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Plan:</span>
                  <div className="font-medium">{selectedRequest.plan.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <div className="font-medium">{selectedRequest.plan.duration}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Included Users:</span>
                  <div className="font-medium">{selectedRequest.plan.includedUsers}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Additional Users:</span>
                  <div className="font-medium">{selectedRequest.additionalUsers}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <div className="font-medium text-lg">₹{selectedRequest.totalAmount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div>
                    <Badge className={`${getStatusColor(selectedRequest.status)} capitalize`}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedRequest?.status === "pending" && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1"
                  data-testid="button-reject"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-approve"
                >
                  Approve & Activate
                </Button>
              </div>
            )}
            {selectedRequest?.status === "approved" && (
              <div className="text-sm text-muted-foreground">
                This request has already been approved.
              </div>
            )}
            {selectedRequest?.status === "rejected" && (
              <div className="text-sm text-destructive">
                This request has been rejected.
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
