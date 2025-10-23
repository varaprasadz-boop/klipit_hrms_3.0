import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface OfflinePaymentRequest {
  id: string;
  companyId: string;
  planId: string;
  amount: number;
  requestedBy: string;
  notes: string;
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
}

interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Plan {
  id: string;
  name: string;
  displayName: string;
}

export default function SuperAdminOfflineRequests() {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: requests = [], isLoading } = useQuery<OfflinePaymentRequest[]>({
    queryKey: ["/api/offline-requests"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["/api/plans/all"],
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("POST", `/api/offline-requests/${requestId}/approve`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offline-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Request approved",
        description: "Company has been activated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve request",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/offline-requests/${requestId}/reject`, { reason });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offline-requests"] });
      setRejectDialogOpen(false);
      setRejectionReason("");
      toast({
        title: "Request rejected",
        description: "Offline payment request has been rejected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject request",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const handleApprove = (requestId: string) => {
    setProcessingId(requestId);
    approveMutation.mutate(requestId);
  };

  const handleRejectClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedRequestId) {
      setProcessingId(selectedRequestId);
      rejectMutation.mutate({ requestId: selectedRequestId, reason: rejectionReason });
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Unknown Company";
  };

  const getCompanyEmail = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.email || "";
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.displayName || "Unknown Plan";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" data-testid={`badge-status-approved`}>Approved</Badge>;
      case "pending":
        return <Badge variant="secondary" data-testid={`badge-status-pending`}>Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive" data-testid={`badge-status-rejected`}>Rejected</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Offline Payment Requests</h2>
          <p className="text-muted-foreground">Manage company offline payment requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-requests">{requests.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-requests">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-approved-requests">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Companies activated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-rejected-requests">{rejectedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Denied</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading requests...</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No offline requests found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} data-testid={`request-card-${request.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {getCompanyName(request.companyId)}
                            </CardTitle>
                            <CardDescription>
                              {getCompanyEmail(request.companyId)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium">{getPlanName(request.planId)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium text-lg">₹{request.amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {request.notes && (
                              <div>
                                <span className="text-sm text-muted-foreground">Notes:</span>
                                <p className="text-sm mt-1 p-2 bg-muted rounded">{request.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleRejectClick(request.id)}
                            disabled={processingId === request.id}
                            data-testid={`button-reject-${request.id}`}
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            data-testid={`button-approve-${request.id}`}
                          >
                            {processingId === request.id ? "Approving..." : "Approve & Activate"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {approvedRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Approved Requests</h3>
                <div className="space-y-3">
                  {approvedRequests.map((request) => (
                    <Card key={request.id} data-testid={`request-card-${request.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {getCompanyName(request.companyId)}
                            </CardTitle>
                            <CardDescription>
                              {getCompanyEmail(request.companyId)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium">{getPlanName(request.planId)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium text-lg">₹{request.amount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Approved:</span>
                              <span>
                                {request.approvedAt
                                  ? formatDistanceToNow(new Date(request.approvedAt), { addSuffix: true })
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {rejectedRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Rejected Requests</h3>
                <div className="space-y-3">
                  {rejectedRequests.map((request) => (
                    <Card key={request.id} data-testid={`request-card-${request.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {getCompanyName(request.companyId)}
                            </CardTitle>
                            <CardDescription>
                              {getCompanyEmail(request.companyId)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium">{getPlanName(request.planId)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium text-lg">₹{request.amount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {request.rejectionReason && (
                              <div>
                                <span className="text-sm text-muted-foreground">Rejection Reason:</span>
                                <p className="text-sm mt-1 p-2 bg-destructive/10 rounded">{request.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent data-testid="dialog-reject-request">
          <DialogHeader>
            <DialogTitle>Reject Offline Payment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment request. This will be visible to the company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              data-testid="textarea-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              data-testid="button-cancel-reject"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || !!processingId}
              data-testid="button-confirm-reject"
            >
              {processingId ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
