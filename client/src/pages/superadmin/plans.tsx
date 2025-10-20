import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Edit } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$99",
    period: "per month",
    description: "Perfect for small teams getting started",
    features: ["Up to 50 employees", "Basic attendance tracking", "Leave management", "Email support"],
    active: true,
  },
  {
    name: "Premium",
    price: "$299",
    period: "per month",
    description: "For growing companies with advanced needs",
    features: ["Up to 200 employees", "Advanced analytics", "Payroll processing", "Performance reviews", "Priority support"],
    active: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$599",
    period: "per month",
    description: "Complete solution for large organizations",
    features: ["Unlimited employees", "Custom workflows", "API access", "Dedicated account manager", "24/7 support", "Custom integrations"],
    active: true,
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Plans</h2>
          <p className="text-muted-foreground">Manage subscription plans and pricing</p>
        </div>
        <Button data-testid="button-add-plan">
          <Edit className="mr-2 h-4 w-4" />
          Edit Pricing
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                {plan.popular && <Badge>Popular</Badge>}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" data-testid={`button-edit-${plan.name.toLowerCase()}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
