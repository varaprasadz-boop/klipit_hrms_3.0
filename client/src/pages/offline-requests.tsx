import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface OfflineRequest {
  id: number;
  type: string;
  plan: {
    name: string;
    duration: string;
    includedUsers: number;
  };
  amount: number;
  additionalUsers: number;
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function OfflineRequests() {
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("offline-requests");

  // Sample data - will be replaced with actual API data
  const [requests, setRequests] = useState<OfflineRequest[]>([
    {
      id: 4,
      type: "Plan",
      plan: {
        name: "Basic",
        duration: "1 months",
        includedUsers: 1,
      },
      amount: 50,
      additionalUsers: 6,
      totalAmount: 230,
      status: "pending",
      createdAt: "2025.10-20",
    },
  ]);

  const handleCancel = (id: number) => {
    setRequests(requests.filter(req => req.id !== id));
    toast({
      title: "Request Cancelled",
      description: "Your offline payment request has been cancelled.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 mb-6 text-sm border-b">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-2 ${
              activeTab === "dashboard"
                ? "text-primary font-medium border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-dashboard"
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("order-history")}
            className={`pb-2 ${
              activeTab === "order-history"
                ? "text-primary font-medium border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-order-history"
          >
            Order History
          </button>
          <button
            onClick={() => setActiveTab("offline-requests")}
            className={`pb-2 flex items-center gap-2 ${
              activeTab === "offline-requests"
                ? "text-primary font-medium border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-offline-requests"
          >
            Offline Requests
            {requests.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("domain-requests")}
            className={`pb-2 ${
              activeTab === "domain-requests"
                ? "text-primary font-medium border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-domain-requests"
          >
            Domain Requests
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Offline Requests</h1>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span>Show</span>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="w-20" data-testid="select-page-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Search:</span>
                <Input
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      REQUEST ID
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      TYPE
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      PLAN
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      AMOUNT
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      ADDITIONAL USERS
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      TOTAL AMOUNT
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      STATUS
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      CREATED AT
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b">
                      <td className="py-4 px-2">{request.id}</td>
                      <td className="py-4 px-2">{request.type}</td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          <div className="font-medium">{request.plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Duration:</span> {request.plan.duration}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Included Users:</span> {request.plan.includedUsers}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">₹{request.amount}</td>
                      <td className="py-4 px-2">{request.additionalUsers}</td>
                      <td className="py-4 px-2">₹{request.totalAmount}</td>
                      <td className="py-4 px-2">
                        <Badge className={`${getStatusColor(request.status)} capitalize`}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">{request.createdAt}</td>
                      <td className="py-4 px-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(request.id)}
                          data-testid={`button-cancel-${request.id}`}
                        >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="text-muted-foreground">
                Showing 1 to {requests.length} of {requests.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled data-testid="button-previous">
                  Previous
                </Button>
                <Button variant="default" size="sm" data-testid="button-page-1">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled data-testid="button-next">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
