import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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

const initialPlans = [
  {
    id: "1",
    name: "Basic",
    baseCost: 299,
    minEmployees: 10,
    perEmployeeCost: 20,
    description: "Perfect for small teams getting started",
    features: ["attendance", "leave", "employees", "departments", "noticeboard"],
    active: true,
  },
  {
    id: "2",
    name: "Advance",
    baseCost: 599,
    minEmployees: 25,
    perEmployeeCost: 25,
    description: "For growing companies with advanced needs",
    features: ["attendance", "leave", "workflows", "expenses", "payroll", "employees", "departments", "designations", "roles", "shifts", "holidays", "noticeboard", "reports"],
    active: true,
    popular: true,
  },
  {
    id: "3",
    name: "Pro",
    baseCost: 999,
    minEmployees: 50,
    perEmployeeCost: 50,
    description: "Complete solution for large organizations",
    features: ["attendance", "leave", "workflows", "expenses", "payroll", "employees", "departments", "designations", "roles", "ctc", "shifts", "holidays", "leave_types", "expense_types", "live_location", "timeline", "card_view", "lifecycle", "noticeboard", "reports", "api_access", "custom_workflows", "mobile_app"],
    active: true,
  },
];

export default function PlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    baseCost: "",
    minEmployees: "",
    perEmployeeCost: "",
    description: "",
    features: [] as string[],
  });

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      baseCost: "",
      minEmployees: "",
      perEmployeeCost: "",
      description: "",
      features: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      baseCost: String(plan.baseCost),
      minEmployees: String(plan.minEmployees),
      perEmployeeCost: String(plan.perEmployeeCost),
      description: plan.description,
      features: [...plan.features],
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
    toast({
      title: "Plan deleted",
      description: "The plan has been removed successfully.",
    });
  };

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, features: [...formData.features, featureId] });
    } else {
      setFormData({ ...formData, features: formData.features.filter(f => f !== featureId) });
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.baseCost || !formData.minEmployees || !formData.perEmployeeCost) {
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
      name: formData.name,
      baseCost: Number(formData.baseCost),
      minEmployees: Number(formData.minEmployees),
      perEmployeeCost: Number(formData.perEmployeeCost),
      description: formData.description,
      features: formData.features,
      active: true,
    };

    if (editingPlan) {
      setPlans(plans.map(p => 
        p.id === editingPlan.id 
          ? { ...p, ...planData }
          : p
      ));
      toast({
        title: "Plan updated",
        description: "The plan has been updated successfully.",
      });
    } else {
      const newPlan = {
        id: String(plans.length + 1),
        ...planData,
      };
      setPlans([...plans, newPlan]);
      toast({
        title: "Plan created",
        description: "The plan has been created successfully.",
      });
    }

    setIsDialogOpen(false);
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
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.popular ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                {plan.popular && <Badge>Popular</Badge>}
              </div>
              <div className="mt-4 space-y-1">
                <div>
                  <span className="text-3xl font-bold">${plan.baseCost}</span>
                  <span className="text-muted-foreground text-sm ml-2">/month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Includes up to {plan.minEmployees} employees
                </p>
                <p className="text-xs text-muted-foreground">
                  + ${plan.perEmployeeCost} per additional employee
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{plan.features.length} Features Included:</p>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {plan.features.slice(0, 6).map((featureId) => {
                    const feature = availableFeatures.find(f => f.id === featureId);
                    return feature ? (
                      <li key={featureId} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature.name}</span>
                      </li>
                    ) : null;
                  })}
                  {plan.features.length > 6 && (
                    <li className="text-sm text-muted-foreground ml-6">
                      + {plan.features.length - 6} more features
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
                data-testid={`button-edit-${plan.name.toLowerCase()}`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDeletePlan(plan.id)}
                data-testid={`button-delete-${plan.name.toLowerCase()}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic, Advance, Pro"
                  data-testid="input-plan-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the plan"
                  data-testid="input-description"
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseCost">Base Monthly Cost ($) *</Label>
                  <Input
                    id="baseCost"
                    type="number"
                    value={formData.baseCost}
                    onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
                    placeholder="299"
                    data-testid="input-base-cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minEmployees">Min. Employees Included *</Label>
                  <Input
                    id="minEmployees"
                    type="number"
                    value={formData.minEmployees}
                    onChange={(e) => setFormData({ ...formData, minEmployees: e.target.value })}
                    placeholder="10"
                    data-testid="input-min-employees"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perEmployeeCost">Per Employee Cost ($) *</Label>
                  <Input
                    id="perEmployeeCost"
                    type="number"
                    value={formData.perEmployeeCost}
                    onChange={(e) => setFormData({ ...formData, perEmployeeCost: e.target.value })}
                    placeholder="20"
                    data-testid="input-per-employee"
                  />
                </div>
              </div>
              {formData.baseCost && formData.minEmployees && formData.perEmployeeCost && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Pricing Example:</p>
                  <p className="text-sm text-muted-foreground">
                    ${formData.baseCost}/month (up to {formData.minEmployees} employees) + ${formData.perEmployeeCost} per additional employee
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For 50 employees: ${Number(formData.baseCost) + (Math.max(0, 50 - Number(formData.minEmployees)) * Number(formData.perEmployeeCost))}/month
                  </p>
                </div>
              )}
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
            <Button onClick={handleSubmit} data-testid="button-submit">
              {editingPlan ? "Update" : "Create"} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
