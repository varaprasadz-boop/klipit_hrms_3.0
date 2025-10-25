import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";

const availableFeatures = [
  { id: "attendance", name: "Attendance Management", category: "Core" },
  { id: "leave", name: "Leave Management", category: "Core" },
  { id: "workflows", name: "Workflows & Approvals", category: "Core" },
  { id: "expenses", name: "Expense Management", category: "Core" },
  { id: "payroll", name: "Payroll Processing", category: "Core" },
  { id: "noticeboard", name: "Noticeboard", category: "Core" },
  { id: "employees", name: "Employee Management", category: "Organization" },
  { id: "departments", name: "Department Management", category: "Organization" },
  { id: "designations", name: "Designation Management", category: "Organization" },
  { id: "roles", name: "Roles & Levels", category: "Organization" },
  { id: "ctc", name: "CTC Components", category: "Organization" },
  { id: "shifts", name: "Shift Management", category: "Masters" },
  { id: "holidays", name: "Holiday Management", category: "Masters" },
  { id: "leave_types", name: "Leave Types", category: "Masters" },
  { id: "expense_types", name: "Expense Types", category: "Masters" },
  { id: "live_location", name: "Live Location Tracking", category: "Monitoring" },
  { id: "timeline", name: "Timeline View", category: "Monitoring" },
  { id: "card_view", name: "Card View", category: "Monitoring" },
  { id: "lifecycle", name: "Employee Lifecycle", category: "Advanced" },
  { id: "reports", name: "Reports & Analytics", category: "Advanced" },
  { id: "api_access", name: "API Access", category: "Advanced" },
  { id: "custom_workflows", name: "Custom Workflow Builder", category: "Advanced" },
  { id: "mobile_app", name: "Mobile App Access", category: "Advanced" },
];

export default function PlansPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    duration: "1",
    price: "",
    maxEmployees: "",
    employeesIncluded: "",
    pricePerAdditionalEmployee: "",
    features: [] as string[],
    isActive: true,
  });

  // Fetch all plans
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans/all"],
  });

  // Create plan mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/plans", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Plan created",
        description: "The subscription plan has been created successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/plans/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Plan updated",
        description: "The subscription plan has been updated successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/plans/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Plan deleted",
        description: "The subscription plan has been deleted successfully.",
      });
      setDeletingPlanId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
      setDeletingPlanId(null);
    },
  });

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      displayName: "",
      duration: "1",
      price: "",
      maxEmployees: "",
      employeesIncluded: "",
      pricePerAdditionalEmployee: "",
      features: [],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      duration: String(plan.duration),
      price: String(plan.price),
      maxEmployees: String(plan.maxEmployees),
      employeesIncluded: String(plan.employeesIncluded),
      pricePerAdditionalEmployee: String(plan.pricePerAdditionalEmployee),
      features: Array.isArray(plan.features) ? plan.features : [],
      isActive: plan.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlan = (id: string) => {
    setDeletingPlanId(id);
  };

  const confirmDelete = () => {
    if (deletingPlanId) {
      deleteMutation.mutate(deletingPlanId);
    }
  };

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, features: [...formData.features, featureId] });
    } else {
      setFormData({ ...formData, features: formData.features.filter(f => f !== featureId) });
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.displayName || !formData.price || !formData.employeesIncluded || !formData.pricePerAdditionalEmployee || !formData.maxEmployees) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.features.length === 0) {
      toast({
        title: "Validation error",
        description: "Please select at least one feature.",
        variant: "destructive",
      });
      return;
    }

    const planData = {
      name: formData.name.toLowerCase().replace(/\s+/g, "_"),
      displayName: formData.displayName,
      duration: Number(formData.duration),
      price: Number(formData.price),
      maxEmployees: Number(formData.maxEmployees),
      employeesIncluded: Number(formData.employeesIncluded),
      pricePerAdditionalEmployee: Number(formData.pricePerAdditionalEmployee),
      features: formData.features,
      isActive: formData.isActive,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: planData });
    } else {
      createMutation.mutate(planData);
    }
  };

  const getFeaturesByCategory = () => {
    const categories: Record<string, typeof availableFeatures> = {};
    availableFeatures.forEach(feature => {
      if (!categories[feature.category]) {
        categories[feature.category] = [];
      }
      categories[feature.category].push(feature);
    });
    return categories;
  };

  const featuresByCategory = getFeaturesByCategory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold mb-1">Subscription Plans</h2>
          <p className="text-muted-foreground">Manage subscription plans, features, and pricing</p>
        </div>
        <Button onClick={handleCreatePlan} data-testid="button-add-plan">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const features = Array.isArray(plan.features) ? plan.features : [];
          return (
            <Card key={plan.id} className={plan.displayName === "Advance Plan" ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {plan.displayName}
                      {!plan.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1">{plan.name}</CardDescription>
                  </div>
                  {plan.displayName === "Advance Plan" && <Badge>Popular</Badge>}
                </div>
                <div className="mt-4 space-y-1">
                  <div>
                    <span className="text-3xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                    <span className="text-muted-foreground text-sm ml-2">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Includes up to {plan.employeesIncluded} employees
                  </p>
                  <p className="text-xs text-muted-foreground">
                    + ₹{plan.pricePerAdditionalEmployee} per additional employee
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max {plan.maxEmployees} employees
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{features.length} Features Included:</p>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {features.slice(0, 6).map((featureId) => {
                      const feature = availableFeatures.find(f => f.id === featureId);
                      return feature ? (
                        <li key={featureId} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature.name}</span>
                        </li>
                      ) : null;
                    })}
                    {features.length > 6 && (
                      <li className="text-sm text-muted-foreground ml-6">
                        + {features.length - 6} more features
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditPlan(plan)}
                  data-testid={`button-edit-${plan.name}`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeletePlan(plan.id)}
                  data-testid={`button-delete-${plan.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update the plan details and features" : "Configure a new subscription plan with features and pricing"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Plan Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Basic Plan, Advance Plan, Pro Plan"
                  data-testid="input-display-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Internal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., basic, advance, pro"
                  data-testid="input-plan-name"
                />
                <p className="text-xs text-muted-foreground">Lowercase, no spaces (use underscores)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Months) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="1"
                data-testid="input-duration"
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing Structure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Monthly Cost (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299"
                    data-testid="input-base-cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeesIncluded">Employees Included *</Label>
                  <Input
                    id="employeesIncluded"
                    type="number"
                    value={formData.employeesIncluded}
                    onChange={(e) => setFormData({ ...formData, employeesIncluded: e.target.value })}
                    placeholder="10"
                    data-testid="input-employees-included"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerAdditionalEmployee">Per Additional Employee (₹) *</Label>
                  <Input
                    id="pricePerAdditionalEmployee"
                    type="number"
                    value={formData.pricePerAdditionalEmployee}
                    onChange={(e) => setFormData({ ...formData, pricePerAdditionalEmployee: e.target.value })}
                    placeholder="20"
                    data-testid="input-per-employee"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxEmployees">Max Employees *</Label>
                  <Input
                    id="maxEmployees"
                    type="number"
                    value={formData.maxEmployees}
                    onChange={(e) => setFormData({ ...formData, maxEmployees: e.target.value })}
                    placeholder="100"
                    data-testid="input-max-employees"
                  />
                </div>
              </div>
              {formData.price && formData.employeesIncluded && formData.pricePerAdditionalEmployee && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Pricing Example:</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{formData.price}/month (up to {formData.employeesIncluded} employees) + ₹{formData.pricePerAdditionalEmployee} per additional employee
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For 50 employees: ₹{Number(formData.price) + (Math.max(0, 50 - Number(formData.employeesIncluded)) * Number(formData.pricePerAdditionalEmployee))}/month
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Plan Status</Label>
                <p className="text-sm text-muted-foreground">Active plans are visible during registration</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-active"
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Features Included in Plan *</h3>
              <div className="space-y-4">
                {Object.entries(featuresByCategory).map(([category, features]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {features.map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature.id}
                            checked={formData.features.includes(feature.id)}
                            onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked as boolean)}
                            data-testid={`checkbox-${feature.id}`}
                          />
                          <Label
                            htmlFor={feature.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {feature.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Selected: {formData.features.length} features
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPlan ? "Update" : "Create"} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPlanId} onOpenChange={() => setDeletingPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subscription plan. Companies using this plan may be affected.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
