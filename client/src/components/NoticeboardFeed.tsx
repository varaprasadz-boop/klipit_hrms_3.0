import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Notice } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";

export default function NoticeboardFeed() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: "General" });
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "COMPANY_ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: notices = [], isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/notices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({ title: "Notice posted successfully" });
      setFormData({ title: "", content: "", category: "General" });
      setOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to post notice", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/notices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({ title: "Notice deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete notice", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Noticeboard
          </CardTitle>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-create-notice">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Notice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notice</DialogTitle>
                  <DialogDescription>Post a new announcement to the noticeboard</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="notice-title">Title</Label>
                    <Input
                      id="notice-title"
                      placeholder="Notice title"
                      data-testid="input-notice-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notice-category">Category</Label>
                    <Input
                      id="notice-category"
                      placeholder="General"
                      data-testid="input-notice-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notice-content">Content</Label>
                    <Textarea
                      id="notice-content"
                      rows={4}
                      placeholder="Notice content"
                      data-testid="textarea-notice-content"
                      value={formData.content || ""}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    data-testid="button-post-notice"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Posting..." : "Post Notice"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No notices yet. {isAdmin && "Create your first notice!"}
          </div>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} className="p-3 hover-elevate" data-testid={`card-notice-${notice.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {notice.pinned && <Pin className="h-3 w-3 text-primary" data-testid={`icon-pinned-${notice.id}`} />}
                    <p className="font-medium text-sm" data-testid={`text-notice-title-${notice.id}`}>
                      {notice.title}
                    </p>
                  </div>
                  {notice.content && (
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`text-notice-content-${notice.id}`}>
                      {notice.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${notice.id}`}>
                      {notice.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground" data-testid={`text-notice-date-${notice.id}`}>
                      {format(new Date(notice.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                {isAdmin && notice.postedBy === user?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(notice.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-notice-${notice.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
