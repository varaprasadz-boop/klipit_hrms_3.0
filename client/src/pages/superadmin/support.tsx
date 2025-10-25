import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { SupportTicket, Company } from "@shared/schema";

export default function SupportPage() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
    status: "open",
  });
  const { toast } = useToast();

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SupportTicket> }) => {
      return await apiRequest("PATCH", `/api/support-tickets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      toast({ title: "Ticket updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    },
  });

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Unknown Company";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">{priority}</Badge>;
      case "medium":
        return <Badge variant="default">{priority}</Badge>;
      case "low":
        return <Badge variant="secondary">{priority}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">{status}</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">{status}</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">{status}</Badge>;
      case "closed":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateMutation.mutate({ id: ticketId, updates: { status: newStatus } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold mb-1">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Loading support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground" data-testid="text-no-tickets">No support tickets found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground" data-testid={`ticket-id-${ticket.id}`}>
                        {ticket.id}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {getCompanyName(ticket.companyId)}
                    </CardDescription>
                  </div>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => handleStatusChange(ticket.id, value)}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger className="w-[150px]" data-testid={`select-status-${ticket.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              {ticket.description && (
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
