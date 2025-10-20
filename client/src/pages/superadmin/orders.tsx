import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockOrders = [
  { id: "ORD-001", customer: "Tech Solutions Inc", plan: "Premium", amount: "$299", status: "completed", date: "2024-10-19" },
  { id: "ORD-002", customer: "Marketing Pro Ltd", plan: "Basic", amount: "$99", status: "completed", date: "2024-10-18" },
  { id: "ORD-003", customer: "Startup Hub", plan: "Enterprise", amount: "$599", status: "pending", date: "2024-10-17" },
  { id: "ORD-004", customer: "Design Studio", plan: "Premium", amount: "$299", status: "processing", date: "2024-10-16" },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Orders</h2>
        <p className="text-muted-foreground">View and manage all subscription orders</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell className="font-medium">{order.customer}</TableCell>
                <TableCell>{order.plan}</TableCell>
                <TableCell className="font-semibold">{order.amount}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === "completed" ? "default" : 
                      order.status === "processing" ? "secondary" : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
