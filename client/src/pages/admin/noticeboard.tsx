import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  LayoutDashboard, Clock, Umbrella, Workflow, 
  Receipt, Megaphone, FileText, UserPlus, Shield, 
  BarChart3, Settings, Plus, Edit, Trash2,
  Target, Building2, Star, Banknote, Bell, AlertCircle, Info, CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { 
    title: "Monitoring", 
    icon: Target,
    subItems: [
      { title: "Live Location", url: "/dashboard/admin/monitoring/live-location" },
      { title: "Time Line", url: "/dashboard/admin/monitoring/timeline" },
      { title: "Card View", url: "/dashboard/admin/monitoring/card-view" },
    ]
  },
  { 
    title: "Organization", 
    icon: Building2,
    subItems: [
      { title: "Employees", url: "/dashboard/admin/organization/employees" },
      { title: "Departments", url: "/dashboard/admin/organization/departments" },
      { title: "Designations", url: "/dashboard/admin/organization/designations" },
      { title: "Roles & Levels", url: "/dashboard/admin/organization/roles-levels" },
      { title: "CTC Components", url: "/dashboard/admin/organization/ctc-components" },
    ]
  },
  { title: "Attendance", url: "/dashboard/admin/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/admin/leave", icon: Umbrella },
  { title: "Workflows", url: "/dashboard/admin/workflows", icon: Workflow },
  { title: "Expenses", url: "/dashboard/admin/expenses", icon: Receipt },
  { title: "Payroll", url: "/dashboard/admin/payroll", icon: Banknote },
  { 
    title: "Masters", 
    icon: Star,
    subItems: [
      { title: "Shifts", url: "/dashboard/admin/masters/shifts" },
      { title: "Holidays", url: "/dashboard/admin/masters/holidays" },
      { title: "Leave Types", url: "/dashboard/admin/masters/leave-types" },
      { title: "Expense Types", url: "/dashboard/admin/masters/expense-types" },
    ]
  },
  { title: "Lifecycle", url: "/dashboard/admin/lifecycle", icon: UserPlus },
  { title: "Noticeboard", url: "/dashboard/admin/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/admin/payslips", icon: FileText },
  { title: "Reports", url: "/dashboard/admin/reports", icon: BarChart3 },
  { title: "Roles", url: "/dashboard/admin/roles", icon: Shield },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

const initialNotices = [
  {
    id: "1",
    title: "Holiday Notice - Diwali",
    content: "The office will be closed on November 1st for Diwali celebration. Enjoy the festival with your family!",
    category: "holiday",
    priority: "normal",
    postedOn: "2025-10-20",
    postedBy: "HR Department",
  },
  {
    id: "2",
    title: "Upcoming Company Event",
    content: "Join us for our annual team building event on November 15th. Location and timing details will be shared soon.",
    category: "event",
    priority: "high",
    postedOn: "2025-10-19",
    postedBy: "Admin",
  },
  {
    id: "3",
    title: "System Maintenance",
    content: "Our HRMS system will undergo maintenance this weekend. Please complete your pending tasks by Friday.",
    category: "announcement",
    priority: "urgent",
    postedOn: "2025-10-18",
    postedBy: "IT Department",
  },
  {
    id: "4",
    title: "New Policy Update",
    content: "The updated work from home policy is now available. Please review the new guidelines in the employee handbook.",
    category: "policy",
    priority: "normal",
    postedOn: "2025-10-15",
    postedBy: "HR Department",
  },
];

export default function AdminNoticeboardPage() {
  const { toast } = useToast();
  const [notices, setNotices] = useState(initialNotices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "announcement",
    priority: "normal",
  });

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      holiday: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      event: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      announcement: "bg-green-500/10 text-green-600 dark:text-green-400",
      policy: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    };
    return (
      <Badge variant="outline" className={colors[category] || "bg-gray-500/10 text-gray-600 dark:text-gray-400"}>
        <span className="capitalize">{category}</span>
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "high":
        return <Bell className="h-5 w-5 text-orange-500" />;
      case "normal":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const handleCreateNotice = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      content: "",
      category: "announcement",
      priority: "normal",
    });
    setIsDialogOpen(true);
  };

  const handleEditNotice = (notice: any) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
    toast({
      title: "Notice deleted",
      description: "The notice has been removed successfully.",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingNotice) {
      setNotices(notices.map(n => 
        n.id === editingNotice.id 
          ? { ...n, ...formData }
          : n
      ));
      toast({
        title: "Notice updated",
        description: "The notice has been updated successfully.",
      });
    } else {
      const newNotice = {
        id: String(notices.length + 1),
        ...formData,
        postedOn: new Date().toISOString().split('T')[0],
        postedBy: "Admin",
      };
      setNotices([newNotice, ...notices]);
      toast({
        title: "Notice created",
        description: "The notice has been posted successfully.",
      });
    }

    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold mb-1">Noticeboard</h2>
            <p className="text-muted-foreground">Manage company announcements and updates</p>
          </div>
          <Button onClick={handleCreateNotice} data-testid="button-create-notice">
            <Plus className="h-4 w-4 mr-2" />
            Create Notice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{notices.length}</div>
              <p className="text-xs text-muted-foreground">Active notices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-urgent">
                {notices.filter(n => n.priority === "urgent").length}
              </div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-events">
                {notices.filter(n => n.category === "event").length}
              </div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-week">
                {notices.filter(n => new Date(n.postedOn) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <p className="text-xs text-muted-foreground">New notices</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notices</CardTitle>
            <CardDescription>Manage and publish notices for all employees</CardDescription>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-notices">No notices available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <Card key={notice.id} data-testid={`notice-${notice.id}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(notice.priority)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{notice.title}</h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {getCategoryBadge(notice.category)}
                                  <span className="text-xs text-muted-foreground">
                                    Posted by {notice.postedBy} • {format(new Date(notice.postedOn), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditNotice(notice)}
                                  data-testid={`button-edit-${notice.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteNotice(notice.id)}
                                  data-testid={`button-delete-${notice.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notice.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNotice ? "Edit Notice" : "Create New Notice"}</DialogTitle>
              <DialogDescription>
                {editingNotice ? "Update the notice details below" : "Fill in the details to create a new notice"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notice title"
                  data-testid="input-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter notice content"
                  rows={4}
                  data-testid="input-content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleSubmit} data-testid="button-submit">
                {editingNotice ? "Update" : "Create"} Notice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
