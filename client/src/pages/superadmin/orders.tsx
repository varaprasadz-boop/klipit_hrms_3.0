import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Building2, Users, Activity, CreditCard, FileText, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

const menuItems = [
  { title: "Dashboard", url: "/superadmin", icon: LayoutDashboard },
  { title: "Companies", url: "/superadmin/companies", icon: Building2 },
  { title: "Orders", url: "/superadmin/orders", icon: CreditCard },
  { title: "Offline Requests", url: "/superadmin/offline-requests", icon: FileText },
  { title: "All Users", url: "/superadmin/users", icon: Users },
  { title: "System Activity", url: "/superadmin/activity", icon: Activity },
];

interface Order {
  id: string;
  companyId: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  paymentProvider: string;
  paymentIntentId: string;
  metadata: any;
  approvedBy: string | null;
  approvedAt: Date | null;
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

export default function SuperAdminOrders() {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["/api/plans/all"],
  });

  const approveMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/approve`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Order approved",
        description: "Company has been activated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve order",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const handleApprove = (orderId: string) => {
    setProcessingId(orderId);
    approveMutation.mutate(orderId);
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
      case "completed":
        return <Badge variant="default" data-testid={`badge-status-completed`}>Approved</Badge>;
      case "pending":
        return <Badge variant="secondary" data-testid={`badge-status-pending`}>Pending</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const completedOrders = orders.filter(o => o.status === "completed");

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Online Payment Orders</h2>
          <p className="text-muted-foreground">Manage company registration payments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-orders">{orders.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-orders">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-orders">{completedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Companies activated</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading orders...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Pending Orders</h3>
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} data-testid={`order-card-${order.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {getCompanyName(order.companyId)}
                            </CardTitle>
                            <CardDescription>
                              {getCompanyEmail(order.companyId)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium">{getPlanName(order.planId)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium text-lg">₹{order.amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Payment ID:</span>
                              <span className="font-mono text-xs">{order.paymentIntentId}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Provider:</span>
                              <span className="font-medium capitalize">{order.paymentProvider}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                            </div>
                            {order.metadata?.cardLast4 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Card:</span>
                                <span className="font-mono">****{order.metadata.cardLast4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleApprove(order.id)}
                            disabled={processingId === order.id}
                            data-testid={`button-approve-${order.id}`}
                          >
                            {processingId === order.id ? "Approving..." : "Approve & Activate"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Completed Orders</h3>
                <div className="space-y-3">
                  {completedOrders.map((order) => (
                    <Card key={order.id} data-testid={`order-card-${order.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {getCompanyName(order.companyId)}
                            </CardTitle>
                            <CardDescription>
                              {getCompanyEmail(order.companyId)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium">{getPlanName(order.planId)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium text-lg">₹{order.amount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Approved:</span>
                              <span>
                                {order.approvedAt
                                  ? formatDistanceToNow(new Date(order.approvedAt), { addSuffix: true })
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                            </div>
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
    </DashboardLayout>
  );
}
