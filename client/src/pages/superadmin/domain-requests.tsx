import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";

const mockRequests = [
  { id: 1, company: "Tech Solutions Inc", domain: "techsolutions.hrms.com", status: "pending", date: "2024-10-18" },
  { id: 2, company: "Marketing Pro Ltd", domain: "marketingpro.hrms.com", status: "approved", date: "2024-10-17" },
  { id: 3, company: "Startup Hub", domain: "startuphub.hrms.com", status: "pending", date: "2024-10-16" },
];

export default function DomainRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Domain Requests</h2>
        <p className="text-muted-foreground">Review and approve custom domain requests</p>
      </div>

      <div className="grid gap-4">
        {mockRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle>{request.company}</CardTitle>
                  <CardDescription className="mt-1">
                    Requested domain: <span className="font-mono text-foreground">{request.domain}</span>
                  </CardDescription>
                </div>
                <Badge 
                  variant={request.status === "approved" ? "default" : "secondary"}
                  data-testid={`badge-status-${request.id}`}
                >
                  {request.status === "pending" ? (
                    <><Clock className="mr-1 h-3 w-3" /> Pending</>
                  ) : (
                    <><Check className="mr-1 h-3 w-3" /> Approved</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Requested on {request.date}</p>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" data-testid={`button-approve-${request.id}`}>
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-reject-${request.id}`}>
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
