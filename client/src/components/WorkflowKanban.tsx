import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

// todo: remove mock functionality
const mockWorkflows = [
  { id: 1, title: "Leave Approval - John Doe", status: "pending", type: "leave" },
  { id: 2, title: "Expense Claim - ₹5,000", status: "pending", type: "expense" },
  { id: 3, title: "Document Verification", status: "approved", type: "document" },
  { id: 4, title: "Travel Request - Mumbai", status: "rejected", type: "travel" },
];

export default function WorkflowKanban() {
  const pending = mockWorkflows.filter(w => w.status === "pending");
  const approved = mockWorkflows.filter(w => w.status === "approved");
  const rejected = mockWorkflows.filter(w => w.status === "rejected");

  const handleAction = (id: number, action: string) => {
    console.log(`Workflow ${id} - ${action}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pending ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.map(item => (
            <Card key={item.id} className="p-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">{item.title}</p>
                <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleAction(item.id, 'approve')}
                    data-testid={`button-approve-${item.id}`}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleAction(item.id, 'reject')}
                    data-testid={`button-reject-${item.id}`}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Approved ({approved.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {approved.map(item => (
            <Card key={item.id} className="p-3 bg-primary/5">
              <p className="text-sm font-medium">{item.title}</p>
              <Badge variant="default" className="text-xs mt-2">{item.type}</Badge>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <XCircle className="h-4 w-4 text-destructive" />
            Rejected ({rejected.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rejected.map(item => (
            <Card key={item.id} className="p-3 bg-destructive/5">
              <p className="text-sm font-medium">{item.title}</p>
              <Badge variant="secondary" className="text-xs mt-2">{item.type}</Badge>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
