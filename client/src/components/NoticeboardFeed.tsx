import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin, Plus } from "lucide-react";
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

// todo: remove mock functionality
const mockNotices = [
  { id: 1, title: "Office Holiday - Republic Day", date: "Jan 26, 2024", pinned: true, category: "Holiday" },
  { id: 2, title: "New HR Policy Update", date: "Jan 20, 2024", pinned: true, category: "Policy" },
  { id: 3, title: "Team Building Event - Next Week", date: "Jan 18, 2024", pinned: false, category: "Event" },
  { id: 4, title: "Salary Credit - January 2024", date: "Jan 15, 2024", pinned: false, category: "Payroll" },
];

export default function NoticeboardFeed() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Noticeboard
          </CardTitle>
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
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setOpen(false); }}>
                <div className="space-y-2">
                  <Label htmlFor="notice-title">Title</Label>
                  <Input id="notice-title" placeholder="Notice title" data-testid="input-notice-title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice-content">Content</Label>
                  <Textarea id="notice-content" rows={4} placeholder="Notice content" data-testid="textarea-notice-content" />
                </div>
                <Button type="submit" className="w-full" data-testid="button-post-notice">
                  Post Notice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockNotices.map((notice) => (
          <Card key={notice.id} className="p-3 hover-elevate">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {notice.pinned && <Pin className="h-3 w-3 text-primary" />}
                  <p className="font-medium text-sm">{notice.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{notice.category}</Badge>
                  <span className="text-xs text-muted-foreground">{notice.date}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
