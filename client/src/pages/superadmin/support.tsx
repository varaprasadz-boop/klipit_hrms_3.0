import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";

const mockTickets = [
  { 
    id: "TKT-001", 
    customer: "Tech Solutions Inc", 
    subject: "Unable to export payroll reports", 
    priority: "high",
    status: "open", 
    created: "2 hours ago",
    assignee: "Support Team"
  },
  { 
    id: "TKT-002", 
    customer: "Marketing Pro Ltd", 
    subject: "Question about leave approval workflow", 
    priority: "medium",
    status: "in-progress", 
    created: "5 hours ago",
    assignee: "John Support"
  },
  { 
    id: "TKT-003", 
    customer: "Startup Hub", 
    subject: "Feature request: Custom fields", 
    priority: "low",
    status: "open", 
    created: "1 day ago",
    assignee: "Unassigned"
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Support Tickets</h2>
        <p className="text-muted-foreground">Manage customer support requests</p>
      </div>

      <div className="grid gap-4">
        {mockTickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                    <Badge 
                      variant={
                        ticket.priority === "high" ? "destructive" : 
                        ticket.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                  <CardDescription className="mt-1">
                    {ticket.customer} • Assigned to: {ticket.assignee}
                  </CardDescription>
                </div>
                <Button size="sm" data-testid={`button-view-ticket-${ticket.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created {ticket.created}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
