import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Mail, Phone } from "lucide-react";

const mockOfflineRequests = [
  { 
    id: 1, 
    name: "John Business Owner", 
    company: "New Ventures LLC", 
    email: "john@newventures.com",
    phone: "+1 (555) 123-4567",
    plan: "Enterprise",
    status: "pending", 
    date: "2024-10-19" 
  },
  { 
    id: 2, 
    name: "Sarah Manager", 
    company: "Growth Corp", 
    email: "sarah@growthcorp.com",
    phone: "+1 (555) 987-6543",
    plan: "Premium",
    status: "contacted", 
    date: "2024-10-18" 
  },
];

export default function OfflineRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Offline Requests</h2>
        <p className="text-muted-foreground">Sales inquiries and offline registration requests</p>
      </div>

      <div className="grid gap-4">
        {mockOfflineRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle>{request.name}</CardTitle>
                  <CardDescription className="mt-1">{request.company}</CardDescription>
                </div>
                <Badge variant={request.status === "contacted" ? "default" : "secondary"}>
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{request.phone}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Interested in:</span>
                  <span className="ml-2 font-medium">{request.plan} Plan</span>
                  <span className="ml-4 text-muted-foreground">• {request.date}</span>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" data-testid={`button-contact-${request.id}`}>
                      <Check className="mr-1 h-4 w-4" />
                      Mark Contacted
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-dismiss-${request.id}`}>
                      <X className="mr-1 h-4 w-4" />
                      Dismiss
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
