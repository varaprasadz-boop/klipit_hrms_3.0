import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OfflineRequest {
  id: number;
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
  status: "pending" | "approved" | "rejected";
}

const mockRequests: OfflineRequest[] = [
  {
    id: 4,
    user: {
      name: "nov test",
      email: "novtest@mailinator.com",
      initials: "NT",
      avatarColor: "bg-cyan-400",
    },
    type: "Plan",
    plan: {
      name: "Basic",
      duration: "1 months",
      includedUsers: 1,
    },
    additionalUsers: 6,
    totalAmount: 230,
    orderId: null,
    status: "pending",
  },
  {
    id: 3,
    user: {
      name: "Oct Company Oct Company",
      email: "octcompany@mailinator.com",
      initials: "OC",
      avatarColor: "bg-cyan-400",
    },
    type: "Plan",
    plan: {
      name: "Basic",
      duration: "1 months",
      includedUsers: 1,
    },
    additionalUsers: 8,
    totalAmount: 290,
    orderId: "4",
    status: "approved",
  },
  {
    id: 2,
    user: {
      name: "Elon Musk",
      email: "elon@mailinator.com",
      initials: "EM",
      avatarColor: "bg-cyan-400",
    },
    type: "Plan",
    plan: {
      name: "Basic",
      duration: "1 months",
      includedUsers: 1,
    },
    additionalUsers: 1,
    totalAmount: 80,
    orderId: "3",
    status: "approved",
  },
];

export default function OfflineRequestsPage() {
  const [pageSize, setPageSize] = useState("7");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<OfflineRequest | null>(null);
  const [requests, setRequests] = useState(mockRequests);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-yellow-900 hover:bg-yellow-400";
      case "approved":
        return "bg-green-400 text-green-900 hover:bg-green-400";
      case "rejected":
        return "bg-red-400 text-red-900 hover:bg-red-400";
      default:
        return "bg-gray-400 text-gray-900";
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: "approved" as const, orderId: String(Math.floor(Math.random() * 1000)) }
          : req
      ));
      
      // Store the company email for the dashboard
      localStorage.setItem("companyEmail", selectedRequest.user.email);
      
      toast({
        title: "Request Approved",
        description: `Offline payment request for ${selectedRequest.user.name} has been approved. Redirecting to company dashboard...`,
      });
      
      setSelectedRequest(null);
      
      // Redirect to company admin dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard/admin";
      }, 2000);
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: "rejected" as const }
          : req
      ));
      toast({
        title: "Request Rejected",
        description: `Offline payment request for ${selectedRequest.user.name} has been rejected.`,
        variant: "destructive",
      });
      setSelectedRequest(null);
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
                        {request.status}
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
